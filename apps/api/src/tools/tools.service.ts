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
import { PhaseTool } from '../phases/entities/phase-tool.entity.js';
import { CreateToolDto } from './dto/create-tool.dto.js';
import { ToolQueryDto } from './dto/tool-query.dto.js';
import { UpdateToolDto } from './dto/update-tool.dto.js';
import { Tool } from './entities/tool.entity.js';

export type ToolWithPhases = Tool & { phaseIds: string[] };

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(Tool) private readonly toolsRepository: Repository<Tool>,
    @InjectRepository(PhaseTool) private readonly phaseToolsRepository: Repository<PhaseTool>,
  ) {}

  // Mesma situação de phases.name: uniqueness só a nível de aplicação no
  // Rails (case-sensitive por padrão), sem índice único no Postgres.
  private async assertUniqueName(name: string, excludeId?: string): Promise<void> {
    const existing = await this.toolsRepository
      .createQueryBuilder('tool')
      .where('tool.name = :name', { name })
      .andWhere(excludeId ? 'tool.id != :excludeId' : '1=1', { excludeId })
      .getOne();

    if (existing) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { name: ['já está em uso'] },
      });
    }
  }

  // Recebe o EntityManager da transação do chamador (create/update) pra que
  // a troca de vínculos e o save do Tool sejam atômicos: sem isso, um
  // phaseId inválido deixaria o Tool já persistido "órfão" mesmo a API
  // respondendo 422 como se nada tivesse sido salvo.
  private async setPhases(manager: EntityManager, toolId: string, phaseIds: string[]): Promise<void> {
    await manager.delete(PhaseTool, { toolId });
    if (phaseIds.length === 0) return;

    const rows = phaseIds.map((phaseId) => manager.create(PhaseTool, { toolId, phaseId }));
    try {
      await manager.save(rows);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { phaseIds: ['uma ou mais fases informadas não existem'] },
        });
      }
      throw error;
    }
  }

  private async getPhaseIds(toolId: string): Promise<string[]> {
    const rows = await this.phaseToolsRepository.find({ where: { toolId } });
    return rows.map((row) => row.phaseId);
  }

  private async getPhaseIdsMap(toolIds: string[]): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (toolIds.length === 0) return map;

    const rows = await this.phaseToolsRepository.find({ where: { toolId: In(toolIds) } });
    for (const row of rows) {
      const list = map.get(row.toolId) ?? [];
      list.push(row.phaseId);
      map.set(row.toolId, list);
    }
    return map;
  }

  async create(dto: CreateToolDto): Promise<ToolWithPhases> {
    await this.assertUniqueName(dto.name);
    return this.toolsRepository.manager.transaction(async (manager) => {
      const tool = await manager.save(manager.create(Tool, { name: dto.name }));
      if (dto.phaseIds) await this.setPhases(manager, tool.id, dto.phaseIds);
      return Object.assign(tool, { phaseIds: dto.phaseIds ?? [] });
    });
  }

  async findAll(query: ToolQueryDto): Promise<PaginatedResult<ToolWithPhases>> {
    const qb = this.toolsRepository.createQueryBuilder('tool').orderBy('LOWER(tool.name)', 'ASC');

    if (query.q) qb.andWhere('tool.name ILIKE :q', { q: `%${query.q}%` });
    if (query.phaseId) {
      const rows = await this.phaseToolsRepository.find({ where: { phaseId: query.phaseId } });
      const toolIds = rows.map((row) => row.toolId);
      qb.andWhere(toolIds.length > 0 ? 'tool.id IN (:...toolIds)' : '1=0', { toolIds });
    }

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    const phaseIdsMap = await this.getPhaseIdsMap(data.map((tool) => tool.id));
    const withPhases = data.map((tool) => Object.assign(tool, { phaseIds: phaseIdsMap.get(tool.id) ?? [] }));

    return paginate(withPhases, total, query.page, query.per);
  }

  async findOne(id: string): Promise<ToolWithPhases> {
    const tool = await this.toolsRepository.findOne({ where: { id } });
    if (!tool) throw new NotFoundException('Ferramenta não encontrada');
    return Object.assign(tool, { phaseIds: await this.getPhaseIds(id) });
  }

  async update(id: string, dto: UpdateToolDto): Promise<ToolWithPhases> {
    const tool = await this.findOne(id);
    if (dto.name && dto.name !== tool.name) await this.assertUniqueName(dto.name, id);

    return this.toolsRepository.manager.transaction(async (manager) => {
      tool.name = dto.name ?? tool.name;
      await manager.save(tool);

      if (dto.phaseIds) {
        await this.setPhases(manager, id, dto.phaseIds);
        tool.phaseIds = dto.phaseIds;
      }

      return tool;
    });
  }

  async remove(id: string): Promise<void> {
    const tool = await this.findOne(id);
    try {
      await this.toolsRepository.remove(tool);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: esta ferramenta está vinculada a outros registros');
      }
      throw error;
    }
  }
}
