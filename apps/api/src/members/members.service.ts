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
import { CreateMemberDto } from './dto/create-member.dto.js';
import { MemberQueryDto } from './dto/member-query.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { DEFAULT_MEMBER_ROLE } from './enums/role.enum.js';
import { MemberModality } from './enums/modality.enum.js';
import { Member } from './entities/member.entity.js';

@Injectable()
export class MembersService {
  constructor(@InjectRepository(Member) private readonly membersRepository: Repository<Member>) {}

  private async saveWithUser(member: Member): Promise<Member> {
    try {
      return await this.membersRepository.save(member);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { userId: ['usuário informado não existe'] },
        });
      }
      throw error;
    }
  }

  async create(teamId: string, dto: CreateMemberDto): Promise<Member> {
    const member = this.membersRepository.create({
      teamId,
      userId: dto.userId,
      modality: dto.modality ?? MemberModality.PRESENCIAL,
      role: dto.role ?? DEFAULT_MEMBER_ROLE,
      active: dto.active ?? true,
    });

    const saved = await this.saveWithUser(member);
    return this.findOne(teamId, saved.id);
  }

  // API declarativa em vez de query builder com leftJoinAndSelect: ver
  // comentário equivalente em ClustersService.findAll sobre o bug do
  // TypeORM com joins-com-hidratação + skip/take.
  async findAll(teamId: string, query: MemberQueryDto): Promise<PaginatedResult<Member>> {
    const where: FindOptionsWhere<Member> = { teamId };
    if (query.active !== undefined) where.active = query.active === 'true';
    if (query.role !== undefined) where.role = query.role;

    const [data, total] = await this.membersRepository.findAndCount({
      where,
      relations: ['user'],
      order: { role: 'ASC', user: { fullName: 'ASC' } },
      skip: (query.page - 1) * query.per,
      take: query.per,
    });

    return paginate(data, total, query.page, query.per);
  }

  async findOne(teamId: string, id: string): Promise<Member> {
    const member = await this.membersRepository.findOne({ where: { id, teamId }, relations: ['user'] });
    if (!member) throw new NotFoundException('Membro não encontrado');
    return member;
  }

  async update(teamId: string, id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(teamId, id);
    Object.assign(member, {
      userId: dto.userId ?? member.userId,
      modality: dto.modality ?? member.modality,
      role: dto.role ?? member.role,
      active: dto.active ?? member.active,
    });
    await this.saveWithUser(member);
    return this.findOne(teamId, id);
  }

  async remove(teamId: string, id: string): Promise<void> {
    const member = await this.findOne(teamId, id);
    try {
      await this.membersRepository.remove(member);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: este membro está vinculado a outros registros');
      }
      throw error;
    }
  }
}
