import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, In, Repository } from 'typeorm';
import { isForeignKeyViolation } from '../common/utils/database-error.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { CreatePhaseDto } from './dto/create-phase.dto.js';
import { PhaseQueryDto } from './dto/phase-query.dto.js';
import { UpdatePhaseDto } from './dto/update-phase.dto.js';
import { Phase } from './entities/phase.entity.js';
import { PhaseTool } from './entities/phase-tool.entity.js';

export type PhaseWithTools = Phase & { toolIds: string[] };

@Injectable()
export class PhasesService {
  constructor(
    @InjectRepository(Phase) private readonly phasesRepository: Repository<Phase>,
    @InjectRepository(PhaseTool) private readonly phaseToolsRepository: Repository<PhaseTool>,
  ) {}

  // phases.name não tem uniqueness validada por índice único no Postgres
  // (só a nível de aplicação no Rails, `validates :name, uniqueness: true`,
  // que é case-sensitive por padrão) — por isso a checagem prévia aqui.
  private async assertUniqueName(name: string, excludeId?: string): Promise<void> {
    const existing = await this.phasesRepository
      .createQueryBuilder('phase')
      .where('phase.name = :name', { name })
      .andWhere(excludeId ? 'phase.id != :excludeId' : '1=1', { excludeId })
      .getOne();

    if (existing) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { name: ['já está em uso'] },
      });
    }
  }

  // Recebe o EntityManager da transação do chamador (create/update) pra que
  // a troca de vínculos e o save do Phase sejam atômicos: sem isso, um
  // toolId inválido deixaria o Phase já persistido "órfão" mesmo a API
  // respondendo 422 como se nada tivesse sido salvo.
  private async setTools(manager: EntityManager, phaseId: string, toolIds: string[]): Promise<void> {
    await manager.delete(PhaseTool, { phaseId });
    if (toolIds.length === 0) return;

    const rows = toolIds.map((toolId) => manager.create(PhaseTool, { phaseId, toolId }));
    try {
      await manager.save(rows);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { toolIds: ['uma ou mais ferramentas informadas não existem'] },
        });
      }
      throw error;
    }
  }

  private async getToolIds(phaseId: string): Promise<string[]> {
    const rows = await this.phaseToolsRepository.find({ where: { phaseId } });
    return rows.map((row) => row.toolId);
  }

  private async getToolIdsMap(phaseIds: string[]): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (phaseIds.length === 0) return map;

    const rows = await this.phaseToolsRepository.find({ where: { phaseId: In(phaseIds) } });
    for (const row of rows) {
      const list = map.get(row.phaseId) ?? [];
      list.push(row.toolId);
      map.set(row.phaseId, list);
    }
    return map;
  }

  async create(dto: CreatePhaseDto): Promise<PhaseWithTools> {
    await this.assertUniqueName(dto.name);
    return this.phasesRepository.manager.transaction(async (manager) => {
      const phase = await manager.save(manager.create(Phase, { name: dto.name }));
      if (dto.toolIds) await this.setTools(manager, phase.id, dto.toolIds);
      return Object.assign(phase, { toolIds: dto.toolIds ?? [] });
    });
  }

  // Sem join na query paginada de propósito: combinar join + skip/take +
  // ORDER BY cru quebra a reescrita do ORDER BY do TypeORM (mesmo bug
  // documentado em ClustersService.findAll) — resolve o filtro de toolId
  // como uma lista de IDs antes, via lookup separado na tabela de junção.
  async findAll(query: PhaseQueryDto): Promise<PaginatedResult<PhaseWithTools>> {
    const qb = this.phasesRepository.createQueryBuilder('phase').orderBy('LOWER(phase.name)', 'ASC');

    if (query.q) qb.andWhere('phase.name ILIKE :q', { q: `%${query.q}%` });
    if (query.toolId) {
      const rows = await this.phaseToolsRepository.find({ where: { toolId: query.toolId } });
      const phaseIds = rows.map((row) => row.phaseId);
      qb.andWhere(phaseIds.length > 0 ? 'phase.id IN (:...phaseIds)' : '1=0', { phaseIds });
    }

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    const toolIdsMap = await this.getToolIdsMap(data.map((phase) => phase.id));
    const withTools = data.map((phase) => Object.assign(phase, { toolIds: toolIdsMap.get(phase.id) ?? [] }));

    return paginate(withTools, total, query.page, query.per);
  }

  async findOne(id: string): Promise<PhaseWithTools> {
    const phase = await this.phasesRepository.findOne({ where: { id } });
    if (!phase) throw new NotFoundException('Fase não encontrada');
    return Object.assign(phase, { toolIds: await this.getToolIds(id) });
  }

  async update(id: string, dto: UpdatePhaseDto): Promise<PhaseWithTools> {
    const phase = await this.findOne(id);
    if (dto.name && dto.name !== phase.name) await this.assertUniqueName(dto.name, id);

    return this.phasesRepository.manager.transaction(async (manager) => {
      phase.name = dto.name ?? phase.name;
      await manager.save(phase);

      if (dto.toolIds) {
        await this.setTools(manager, id, dto.toolIds);
        phase.toolIds = dto.toolIds;
      }

      return phase;
    });
  }

  async remove(id: string): Promise<void> {
    const phase = await this.findOne(id);
    try {
      await this.phasesRepository.remove(phase);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: esta fase está vinculada a outros registros');
      }
      throw error;
    }
  }
}
