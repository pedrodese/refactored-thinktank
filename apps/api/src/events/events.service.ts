import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { isForeignKeyViolation } from '../common/utils/database-error.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { Attendance } from '../attendances/entities/attendance.entity.js';
import { AttendanceStatus } from '../attendances/enums/status.enum.js';
import { Cluster } from '../clusters/entities/cluster.entity.js';
import { Meeting } from '../meetings/entities/meeting.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { EventQueryDto } from './dto/event-query.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { EVENT_COMMENT_REQUIRED_SCORES, EventScore } from './enums/event-score.enum.js';
import { Event } from './entities/event.entity.js';

const PENDING_SCORE_CLAUSE =
  '(event.item_a_score IS NULL OR event.item_b_score IS NULL OR event.item_c_score IS NULL OR event.item_d_score IS NULL ' +
  'OR EXISTS (SELECT 1 FROM attendances a WHERE a.event_id = event.id AND a.status = 0))';

const ITEM_LABELS: Record<'itemA' | 'itemB' | 'itemC' | 'itemD', string> = {
  itemA: 'Participação dos membros',
  itemB: 'Desenvolvimento do projeto',
  itemC: 'Relacionamento da equipe',
  itemD: 'Comprometimento com prazos',
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Meeting) private readonly meetingsRepository: Repository<Meeting>,
    @InjectRepository(Attendance) private readonly attendancesRepository: Repository<Attendance>,
    @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
    @InjectRepository(Cluster) private readonly clustersRepository: Repository<Cluster>,
  ) {}

  // Consultado pelos controllers (Events/Attendances/ToolEventAssessments/
  // TeamBulkEvaluations) pra checagem de propriedade do facilitator via
  // Event -> Team -> Cluster.
  async getOwnershipForTeam(
    teamId: string,
  ): Promise<{ facilitatorId: string | null; auxiliaryFacilitatorId: string | null } | null> {
    const team = await this.teamsRepository.findOne({ where: { id: teamId }, select: ['id', 'clusterId'] });
    if (!team?.clusterId) return null;
    return this.clustersRepository.findOne({
      where: { id: team.clusterId },
      select: ['id', 'facilitatorId', 'auxiliaryFacilitatorId'],
    });
  }

  private async fetchMeetingName(meetingId: string): Promise<string> {
    const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Reunião não encontrada');
    return meeting.name;
  }

  private async saveWithReferences(event: Event): Promise<Event> {
    try {
      return await this.eventsRepository.save(event);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { teamId: ['equipe ou reunião informada não existe'] },
        });
      }
      throw error;
    }
  }

  async create(dto: CreateEventDto): Promise<Event> {
    const name = await this.fetchMeetingName(dto.meetingId);
    const event = this.eventsRepository.create({
      teamId: dto.teamId,
      meetingId: dto.meetingId,
      name,
      date: dto.date ?? new Date().toISOString().slice(0, 10),
    });
    return this.saveWithReferences(event);
  }

  async findAll(query: EventQueryDto, facilitatorScopeId?: string | null): Promise<PaginatedResult<Event>> {
    const qb = this.eventsRepository.createQueryBuilder('event').orderBy('event.date', 'ASC');

    if (query.teamId) qb.andWhere('event.team_id = :teamId', { teamId: query.teamId });
    if (query.meetingId) qb.andWhere('event.meeting_id = :meetingId', { meetingId: query.meetingId });
    if (query.pending === 'true') qb.andWhere(PENDING_SCORE_CLAUSE);

    if (facilitatorScopeId) {
      const ownClusters = await this.clustersRepository.find({
        where: [{ facilitatorId: facilitatorScopeId }, { auxiliaryFacilitatorId: facilitatorScopeId }],
        select: ['id'],
      });
      const clusterIds = ownClusters.map((cluster) => cluster.id);
      const ownTeams = clusterIds.length
        ? await this.teamsRepository.find({ where: { clusterId: In(clusterIds) }, select: ['id'] })
        : [];
      const teamIds = ownTeams.map((team) => team.id);
      qb.andWhere(teamIds.length > 0 ? 'event.team_id IN (:...teamIds)' : '1=0', { teamIds });
    }

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    return paginate(data, total, query.page, query.per);
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }

  async getPendingAttendancesCount(eventId: string): Promise<number> {
    return this.attendancesRepository.count({ where: { eventId, status: AttendanceStatus.NOT_REGISTERED } });
  }

  // Usado pela tela de avaliação em lote (team-bulk-evaluations): sem
  // paginação de propósito, igual `@team.events.pending_assessment` do
  // Rails — o conjunto de pendências de uma equipe é sempre pequeno.
  async findAllPendingForTeam(teamId: string): Promise<Event[]> {
    return this.eventsRepository
      .createQueryBuilder('event')
      .where('event.team_id = :teamId', { teamId })
      .andWhere(PENDING_SCORE_CLAUSE)
      .orderBy('event.date', 'DESC')
      .getMany();
  }

  // Replica as validations condicionais de app/models/event.rb: score
  // obrigatório só quando força validação (goToNext); comentário obrigatório
  // quando o score resultante é pessimo/ruim/nao_se_aplica (sempre, pois
  // essas validações só existem em update mesmo — e o create não expõe
  // esses campos).
  private assertAssessmentRules(event: Event, forceValidation: boolean): void {
    const items: Array<{ key: 'itemA' | 'itemB' | 'itemC' | 'itemD'; score: EventScore | null; comment: string }> = [
      { key: 'itemA', score: event.itemAScore, comment: event.itemAComment },
      { key: 'itemB', score: event.itemBScore, comment: event.itemBComment },
      { key: 'itemC', score: event.itemCScore, comment: event.itemCComment },
      { key: 'itemD', score: event.itemDScore, comment: event.itemDComment },
    ];

    const errors: Record<string, string[]> = {};
    for (const item of items) {
      if (forceValidation && item.score === null) {
        errors[`${item.key}Score`] = ['precisa ser preenchido'];
      }
      if (item.score !== null && EVENT_COMMENT_REQUIRED_SCORES.includes(item.score) && !item.comment) {
        errors[`${item.key}Comment`] = [
          `de '${ITEM_LABELS[item.key]}' deve ser preenchido quando a avaliação é péssima, ruim ou não se aplica`,
        ];
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new UnprocessableEntityException({ message: 'Validation failed', errors });
    }
  }

  // Equivalente a Event#validate_attendances: só roda quando forceValidation
  // (goToNext), citando o nome do membro na mensagem de erro.
  private async assertAttendancesRegistered(eventId: string): Promise<void> {
    const attendances = await this.attendancesRepository.find({
      where: { eventId },
      relations: ['member', 'member.user'],
    });
    const messages = attendances
      .filter((attendance) => attendance.status === AttendanceStatus.NOT_REGISTERED)
      .map((attendance) => `É necessário selecionar a Presença ou Ausência para ${attendance.member.user.fullName}`);

    if (messages.length > 0) {
      throw new UnprocessableEntityException({ message: 'Validation failed', errors: { attendances: messages } });
    }
  }

  private async findNextPendingEvent(event: Event): Promise<Event | null> {
    const today = new Date().toISOString().slice(0, 10);
    return this.eventsRepository
      .createQueryBuilder('event')
      .where('event.team_id = :teamId', { teamId: event.teamId })
      .andWhere('event.id != :id', { id: event.id })
      .andWhere('event.date <= :today', { today })
      .andWhere(PENDING_SCORE_CLAUSE)
      .orderBy('event.date', 'DESC')
      .getOne();
  }

  async update(id: string, dto: UpdateEventDto): Promise<{ event: Event; nextPendingEvent: Event | null }> {
    const event = await this.findOne(id);
    const forceValidation = dto.goToNext === true;

    if (dto.meetingId && dto.meetingId !== event.meetingId) {
      event.name = await this.fetchMeetingName(dto.meetingId);
      event.meetingId = dto.meetingId;
    } else if (dto.name !== undefined) {
      event.name = dto.name;
    }

    if (dto.teamId !== undefined) event.teamId = dto.teamId;
    if (dto.date !== undefined) event.date = dto.date;
    if (dto.generalComments !== undefined) event.generalComments = dto.generalComments;
    if (dto.itemAScore !== undefined) event.itemAScore = dto.itemAScore;
    if (dto.itemAComment !== undefined) event.itemAComment = dto.itemAComment;
    if (dto.itemBScore !== undefined) event.itemBScore = dto.itemBScore;
    if (dto.itemBComment !== undefined) event.itemBComment = dto.itemBComment;
    if (dto.itemCScore !== undefined) event.itemCScore = dto.itemCScore;
    if (dto.itemCComment !== undefined) event.itemCComment = dto.itemCComment;
    if (dto.itemDScore !== undefined) event.itemDScore = dto.itemDScore;
    if (dto.itemDComment !== undefined) event.itemDComment = dto.itemDComment;

    this.assertAssessmentRules(event, forceValidation);
    if (forceValidation) await this.assertAttendancesRegistered(id);

    await this.saveWithReferences(event);

    const nextPendingEvent = forceValidation ? await this.findNextPendingEvent(event) : null;
    return { event, nextPendingEvent };
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    try {
      await this.eventsRepository.remove(event);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'Não é possível remover: este evento está vinculado a outros registros (presenças/avaliações)',
        );
      }
      throw error;
    }
  }
}
