import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '../common/utils/database-error.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { AttendanceStatus } from './enums/status.enum.js';
import { Attendance } from './entities/attendance.entity.js';

const RELATIONS = ['member', 'member.user'];

@Injectable()
export class AttendancesService {
  constructor(@InjectRepository(Attendance) private readonly attendancesRepository: Repository<Attendance>) {}

  private assertReasonWhenAbsent(status: AttendanceStatus, reason: string): void {
    if (status === AttendanceStatus.ABSENT && !reason) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { reason: ['É necessário informar o motivo da ausência'] },
      });
    }
  }

  private async save(attendance: Attendance): Promise<Attendance> {
    try {
      return await this.attendancesRepository.save(attendance);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { memberId: ['presença já registrada para esse membro nesse encontro'] },
        });
      }
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { memberId: ['membro informado não existe'] },
        });
      }
      throw error;
    }
  }

  async create(eventId: string, dto: CreateAttendanceDto): Promise<Attendance> {
    const status = dto.status ?? AttendanceStatus.NOT_REGISTERED;
    const reason = dto.reason ?? '';
    this.assertReasonWhenAbsent(status, reason);

    const attendance = this.attendancesRepository.create({ eventId, memberId: dto.memberId, status, reason });
    const saved = await this.save(attendance);
    return this.findOne(eventId, saved.id);
  }

  async findAll(eventId: string, query: AttendanceQueryDto): Promise<PaginatedResult<Attendance>> {
    const where: FindOptionsWhere<Attendance> = { eventId };
    if (query.memberId) where.memberId = query.memberId;
    if (query.status !== undefined) where.status = query.status;

    const [data, total] = await this.attendancesRepository.findAndCount({
      where,
      relations: RELATIONS,
      order: { id: 'ASC' },
      skip: (query.page - 1) * query.per,
      take: query.per,
    });

    return paginate(data, total, query.page, query.per);
  }

  async findOne(eventId: string, id: string): Promise<Attendance> {
    const attendance = await this.attendancesRepository.findOne({ where: { id, eventId }, relations: RELATIONS });
    if (!attendance) throw new NotFoundException('Presença não encontrada');
    return attendance;
  }

  async update(eventId: string, id: string, dto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(eventId, id);
    const status = dto.status ?? attendance.status;
    const reason = dto.reason ?? attendance.reason;
    this.assertReasonWhenAbsent(status, reason);

    attendance.memberId = dto.memberId ?? attendance.memberId;
    attendance.status = status;
    attendance.reason = reason;

    await this.save(attendance);
    return this.findOne(eventId, id);
  }

  // Equivalente ao update_status do Rails: sem validar reason (o registro
  // ausente-sem-motivo-ainda é um estado válido nesse fluxo rápido).
  async updateStatus(eventId: string, id: string, status: AttendanceStatus): Promise<Attendance> {
    const attendance = await this.findOne(eventId, id);
    attendance.status = status;
    await this.attendancesRepository.save(attendance);
    return this.findOne(eventId, id);
  }

  async remove(eventId: string, id: string): Promise<void> {
    const attendance = await this.findOne(eventId, id);
    await this.attendancesRepository.remove(attendance);
  }
}
