import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isForeignKeyViolation } from '../common/utils/database-error.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { CreateMeetingDto } from './dto/create-meeting.dto.js';
import { MeetingQueryDto } from './dto/meeting-query.dto.js';
import { UpdateMeetingDto } from './dto/update-meeting.dto.js';
import { Meeting } from './entities/meeting.entity.js';

@Injectable()
export class MeetingsService {
  constructor(@InjectRepository(Meeting) private readonly meetingsRepository: Repository<Meeting>) {}

  private async savePhaseAware(meeting: Meeting): Promise<Meeting> {
    try {
      return await this.meetingsRepository.save(meeting);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { phaseId: ['fase informada não existe'] },
        });
      }
      throw error;
    }
  }

  async create(dto: CreateMeetingDto): Promise<Meeting> {
    const meeting = this.meetingsRepository.create({
      name: dto.name,
      abbreviation: dto.abbreviation ?? '',
      phaseId: dto.phaseId,
    });
    return this.savePhaseAware(meeting);
  }

  async findAll(query: MeetingQueryDto): Promise<PaginatedResult<Meeting>> {
    const qb = this.meetingsRepository
      .createQueryBuilder('meeting')
      .orderBy('meeting.abbreviation', 'ASC')
      .addOrderBy('meeting.name', 'ASC');

    if (query.q) qb.andWhere('meeting.name ILIKE :q', { q: `%${query.q}%` });
    if (query.phaseId) qb.andWhere('meeting.phase_id = :phaseId', { phaseId: query.phaseId });

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    return paginate(data, total, query.page, query.per);
  }

  async findOne(id: string): Promise<Meeting> {
    const meeting = await this.meetingsRepository.findOne({ where: { id } });
    if (!meeting) throw new NotFoundException('Reunião não encontrada');
    return meeting;
  }

  async update(id: string, dto: UpdateMeetingDto): Promise<Meeting> {
    const meeting = await this.findOne(id);
    Object.assign(meeting, {
      name: dto.name ?? meeting.name,
      abbreviation: dto.abbreviation ?? meeting.abbreviation,
      phaseId: dto.phaseId ?? meeting.phaseId,
    });
    return this.savePhaseAware(meeting);
  }

  async remove(id: string): Promise<void> {
    const meeting = await this.findOne(id);
    try {
      await this.meetingsRepository.remove(meeting);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: esta reunião está vinculada a outros registros');
      }
      throw error;
    }
  }
}
