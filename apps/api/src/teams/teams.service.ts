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
import { Cluster } from '../clusters/entities/cluster.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { MEMBER_MODALITY_LABEL, MemberModality } from '../members/enums/modality.enum.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { TeamQueryDto } from './dto/team-query.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { MIRO_LINK_REGEX, TEAMS_LINK_REGEX } from './teams.constants.js';
import { Team } from './entities/team.entity.js';

export type TeamWithModality = Team & { modality: string };

const NAO_DEFINIDA = 'Não definida';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
    @InjectRepository(Member) private readonly membersRepository: Repository<Member>,
    @InjectRepository(Cluster) private readonly clustersRepository: Repository<Cluster>,
  ) {}

  private async assertUniqueName(name: string, excludeId?: string): Promise<void> {
    const existing = await this.teamsRepository
      .createQueryBuilder('team')
      .where('team.name = :name', { name })
      .andWhere(excludeId ? 'team.id != :excludeId' : '1=1', { excludeId })
      .getOne();

    if (existing) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { name: ['já está em uso'] },
      });
    }
  }

  private assertValidLinkFormat(value: string | undefined, regex: RegExp, field: 'linkMiro' | 'linkTeams'): void {
    if (!value) return;
    if (!regex.test(value)) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { [field]: ['formato inválido'] },
      });
    }
  }

  private normalizeLink(value: string | undefined): string {
    if (!value) return '';
    const withScheme = /^https?:\/\//i.test(value) ? value : `http://${value}`;
    return withScheme.replace(/^http:\/\//i, 'https://');
  }

  private async saveWithReferences(team: Team): Promise<Team> {
    try {
      return await this.teamsRepository.save(team);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { clusterId: ['eixo ou cluster informado não existe'] },
        });
      }
      throw error;
    }
  }

  private async getModalityMap(teamIds: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (teamIds.length === 0) return map;

    const members = await this.membersRepository.find({
      where: { teamId: In(teamIds) },
      select: ['teamId', 'modality'],
    });

    const modalitiesByTeam = new Map<string, MemberModality[]>();
    for (const member of members) {
      if (member.modality === null) continue;
      const list = modalitiesByTeam.get(member.teamId) ?? [];
      list.push(member.modality);
      modalitiesByTeam.set(member.teamId, list);
    }

    for (const teamId of teamIds) {
      const modalities = modalitiesByTeam.get(teamId) ?? [];
      map.set(teamId, this.computeModalityLabel(modalities));
    }
    return map;
  }

  private computeModalityLabel(modalities: MemberModality[]): string {
    if (modalities.length === 0) return NAO_DEFINIDA;
    const unique = [...new Set(modalities)];
    const value = unique.length > 1 ? MemberModality.HIBRIDO : unique[0];
    return MEMBER_MODALITY_LABEL[value];
  }

  async create(dto: CreateTeamDto): Promise<TeamWithModality> {
    await this.assertUniqueName(dto.name);
    this.assertValidLinkFormat(dto.linkMiro, MIRO_LINK_REGEX, 'linkMiro');
    this.assertValidLinkFormat(dto.linkTeams, TEAMS_LINK_REGEX, 'linkTeams');

    const team = this.teamsRepository.create({
      name: dto.name,
      axisId: dto.axisId,
      clusterId: dto.clusterId,
      linkMiro: this.normalizeLink(dto.linkMiro),
      linkTeams: this.normalizeLink(dto.linkTeams),
    });

    const saved = await this.saveWithReferences(team);
    return Object.assign(saved, { modality: NAO_DEFINIDA });
  }

  async findAll(query: TeamQueryDto, facilitatorScopeId?: string | null): Promise<PaginatedResult<TeamWithModality>> {
    const qb = this.teamsRepository.createQueryBuilder('team').orderBy('LOWER(team.name)', 'ASC');

    if (query.q) qb.andWhere('team.name ILIKE :q', { q: `%${query.q}%` });
    if (query.clusterId) qb.andWhere('team.cluster_id = :clusterId', { clusterId: query.clusterId });
    if (query.axisId) qb.andWhere('team.axis_id = :axisId', { axisId: query.axisId });

    if (facilitatorScopeId) {
      const ownClusters = await this.clustersRepository.find({
        where: [{ facilitatorId: facilitatorScopeId }, { auxiliaryFacilitatorId: facilitatorScopeId }],
        select: ['id'],
      });
      const clusterIds = ownClusters.map((cluster) => cluster.id);
      qb.andWhere(clusterIds.length > 0 ? 'team.cluster_id IN (:...clusterIds)' : '1=0', { clusterIds });
    }

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    const modalityMap = await this.getModalityMap(data.map((team) => team.id));
    const withModality = data.map((team) => Object.assign(team, { modality: modalityMap.get(team.id) ?? NAO_DEFINIDA }));

    return paginate(withModality, total, query.page, query.per);
  }

  async findOne(id: string): Promise<TeamWithModality> {
    const team = await this.teamsRepository.findOne({ where: { id } });
    if (!team) throw new NotFoundException('Equipe não encontrada');
    const modalityMap = await this.getModalityMap([id]);
    return Object.assign(team, { modality: modalityMap.get(id) ?? NAO_DEFINIDA });
  }

  async update(id: string, dto: UpdateTeamDto): Promise<TeamWithModality> {
    const team = await this.findOne(id);
    if (dto.name && dto.name !== team.name) await this.assertUniqueName(dto.name, id);
    if (dto.linkMiro !== undefined) this.assertValidLinkFormat(dto.linkMiro, MIRO_LINK_REGEX, 'linkMiro');
    if (dto.linkTeams !== undefined) this.assertValidLinkFormat(dto.linkTeams, TEAMS_LINK_REGEX, 'linkTeams');

    Object.assign(team, {
      name: dto.name ?? team.name,
      axisId: dto.axisId ?? team.axisId,
      clusterId: dto.clusterId ?? team.clusterId,
      linkMiro: dto.linkMiro !== undefined ? this.normalizeLink(dto.linkMiro) : team.linkMiro,
      linkTeams: dto.linkTeams !== undefined ? this.normalizeLink(dto.linkTeams) : team.linkTeams,
    });

    await this.saveWithReferences(team);
    return team;
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    try {
      await this.teamsRepository.remove(team);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: esta equipe está vinculada a outros registros');
      }
      throw error;
    }
  }
}
