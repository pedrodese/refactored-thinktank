import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';
import { isForeignKeyViolation } from '../common/utils/database-error.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { ClusterQueryDto } from './dto/cluster-query.dto.js';
import { CreateClusterDto } from './dto/create-cluster.dto.js';
import { UpdateClusterDto } from './dto/update-cluster.dto.js';
import { Cluster } from './entities/cluster.entity.js';
import { WEEK_DAY_LABEL } from './enums/week-day.enum.js';

export type ClusterWithName = Cluster & { name: string };

const RELATIONS = ['facilitator', 'chapter'];

@Injectable()
export class ClustersService {
  constructor(@InjectRepository(Cluster) private readonly clustersRepository: Repository<Cluster>) {}

  private assertValidSchedule(dto: {
    startTime: string;
    endTime: string;
    startDate?: string;
    endDate?: string;
  }): void {
    if (dto.endTime <= dto.startTime) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { endTime: ['deve ser depois do horário de início'] },
      });
    }

    if (dto.startDate && (!dto.endDate || dto.endDate <= dto.startDate)) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { endDate: ['deve ser depois da data de início'] },
      });
    }
  }

  private computeName(cluster: Cluster): string {
    const dayLabel = WEEK_DAY_LABEL[cluster.weekDay];
    const firstName = cluster.facilitator?.fullName?.split(' ')[0] ?? '';
    const year = cluster.chapter?.editionYear ?? '';
    return `${dayLabel} | ${cluster.startTime} | ${firstName} (${year})`;
  }

  private async saveWithReferences(cluster: Cluster): Promise<Cluster> {
    try {
      return await this.clustersRepository.save(cluster);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { chapterId: ['capítulo, facilitador ou facilitador auxiliar informado não existe'] },
        });
      }
      throw error;
    }
  }

  async create(dto: CreateClusterDto): Promise<ClusterWithName> {
    this.assertValidSchedule(dto);

    const cluster = this.clustersRepository.create({
      active: dto.active ?? true,
      address: dto.address ?? null,
      auxiliaryFacilitatorId: dto.auxiliaryFacilitatorId ?? null,
      chapterId: dto.chapterId,
      endDate: dto.endDate ?? null,
      endTime: dto.endTime,
      facilitatorId: dto.facilitatorId,
      link: dto.link ?? null,
      startDate: dto.startDate ?? null,
      startTime: dto.startTime,
      weekDay: dto.weekDay,
    });

    const saved = await this.saveWithReferences(cluster);
    return this.findOne(saved.id);
  }

  async findAll(query: ClusterQueryDto, facilitatorScopeId?: string | null): Promise<PaginatedResult<ClusterWithName>> {
    const filters: FindOptionsWhere<Cluster> = {};
    if (query.status === 'inactive') filters.active = false;
    else if (query.status !== 'all') filters.active = true;
    if (query.weekDay !== undefined) filters.weekDay = query.weekDay;
    if (query.chapterId) filters.chapterId = query.chapterId;
    if (!facilitatorScopeId) {
      if (query.facilitatorId) filters.facilitatorId = query.facilitatorId;
      if (query.auxiliaryFacilitatorId) filters.auxiliaryFacilitatorId = query.auxiliaryFacilitatorId;
    }

    const where: FindOptionsWhere<Cluster>[] | FindOptionsWhere<Cluster> = facilitatorScopeId
      ? [
          { ...filters, facilitatorId: facilitatorScopeId },
          { ...filters, auxiliaryFacilitatorId: facilitatorScopeId },
        ]
      : filters;

    const [data, total] = await this.clustersRepository.findAndCount({
      where,
      relations: RELATIONS,
      order: { weekDay: 'ASC', startTime: 'ASC' },
      skip: (query.page - 1) * query.per,
      take: query.per,
    });

    const withName = data.map((cluster) => Object.assign(cluster, { name: this.computeName(cluster) }));
    return paginate(withName, total, query.page, query.per);
  }

  async findOne(id: string): Promise<ClusterWithName> {
    const cluster = await this.clustersRepository.findOne({ where: { id }, relations: RELATIONS });
    if (!cluster) throw new NotFoundException('Cluster não encontrado');
    return Object.assign(cluster, { name: this.computeName(cluster) });
  }

  // Consultado pelos módulos de Team/Member pra checagem de propriedade do
  // facilitator, sem precisar carregar o Cluster inteiro.
  async getOwnership(
    clusterId: string | null,
  ): Promise<{ facilitatorId: string | null; auxiliaryFacilitatorId: string | null } | null> {
    if (!clusterId) return null;
    const cluster = await this.clustersRepository.findOne({
      where: { id: clusterId },
      select: ['id', 'facilitatorId', 'auxiliaryFacilitatorId'],
    });
    return cluster ?? null;
  }

  async update(id: string, dto: UpdateClusterDto): Promise<ClusterWithName> {
    const cluster = await this.findOne(id);

    this.assertValidSchedule({
      startTime: dto.startTime ?? cluster.startTime,
      endTime: dto.endTime ?? cluster.endTime,
      startDate: dto.startDate ?? cluster.startDate ?? undefined,
      endDate: dto.endDate ?? cluster.endDate ?? undefined,
    });

    Object.assign(cluster, {
      active: dto.active ?? cluster.active,
      address: dto.address ?? cluster.address,
      auxiliaryFacilitatorId: dto.auxiliaryFacilitatorId ?? cluster.auxiliaryFacilitatorId,
      chapterId: dto.chapterId ?? cluster.chapterId,
      endDate: dto.endDate ?? cluster.endDate,
      endTime: dto.endTime ?? cluster.endTime,
      facilitatorId: dto.facilitatorId ?? cluster.facilitatorId,
      link: dto.link ?? cluster.link,
      startDate: dto.startDate ?? cluster.startDate,
      startTime: dto.startTime ?? cluster.startTime,
      weekDay: dto.weekDay ?? cluster.weekDay,
    });

    await this.saveWithReferences(cluster);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const cluster = await this.findOne(id);
    try {
      await this.clustersRepository.remove(cluster);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: este cluster está vinculado a outros registros');
      }
      throw error;
    }
  }
}
