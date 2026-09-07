import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isForeignKeyViolation } from '../common/utils/database-error.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { AxisQueryDto } from './dto/axis-query.dto.js';
import { CreateAxisDto } from './dto/create-axis.dto.js';
import { UpdateAxisDto } from './dto/update-axis.dto.js';
import { Axis } from './entities/axis.entity.js';

@Injectable()
export class AxesService {
  constructor(@InjectRepository(Axis) private readonly axesRepository: Repository<Axis>) {}

  async create(dto: CreateAxisDto): Promise<Axis> {
    const axis = this.axesRepository.create(dto);
    return this.axesRepository.save(axis);
  }

  async findAll(query: AxisQueryDto): Promise<PaginatedResult<Axis>> {
    const qb = this.axesRepository.createQueryBuilder('axis').orderBy('axis.title', 'ASC');

    if (query.q) qb.andWhere('axis.title ILIKE :q', { q: `%${query.q}%` });

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    return paginate(data, total, query.page, query.per);
  }

  async findOne(id: string): Promise<Axis> {
    const axis = await this.axesRepository.findOne({ where: { id } });
    if (!axis) throw new NotFoundException('Eixo não encontrado');
    return axis;
  }

  async update(id: string, dto: UpdateAxisDto): Promise<Axis> {
    const axis = await this.findOne(id);
    Object.assign(axis, dto);
    return this.axesRepository.save(axis);
  }

  async remove(id: string): Promise<void> {
    const axis = await this.findOne(id);
    try {
      await this.axesRepository.remove(axis);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: este eixo está vinculado a outros registros');
      }
      throw error;
    }
  }
}
