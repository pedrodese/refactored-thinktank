import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import {
  getViolatedConstraint,
  isForeignKeyViolation,
  isUniqueViolation,
} from '../common/utils/database-error.util.js';
import { isValidCpf } from '../common/utils/cpf-cnpj.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { AuthorizationLevel, INTERNAL_TEAM_LEVELS } from './enums/authorization-level.enum.js';
import { User } from './entities/user.entity.js';

const BCRYPT_ROUNDS = 12;

// users.cpf/rg têm índice único parcial no Postgres (criado pelo Rails) — dá
// pra confiar no banco e só traduzir a violação numa mensagem amigável. Já
// users.email NÃO tem índice único no schema real (unicidade só existe a
// nível de aplicação no Rails também) — por isso ainda precisa de uma
// checagem prévia pra esse campo especificamente.
const UNIQUE_CONSTRAINT_FIELD: Record<string, 'cpf' | 'rg'> = {
  index_users_on_cpf: 'cpf',
  index_users_on_rg: 'rg',
};

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  private isPasswordRequired(authorizationLevel: AuthorizationLevel): boolean {
    return authorizationLevel !== AuthorizationLevel.PERSON;
  }

  private isEmailRequired(authorizationLevel: AuthorizationLevel): boolean {
    return INTERNAL_TEAM_LEVELS.includes(authorizationLevel);
  }

  private async assertUniqueEmail(email: string | undefined, excludeId?: string): Promise<void> {
    if (!email) return;

    const existing = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere(excludeId ? 'user.id != :excludeId' : '1=1', { excludeId })
      .getOne();

    if (existing) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { email: ['email já está em uso'] },
      });
    }
  }

  private async saveUser(user: User): Promise<User> {
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        const field = UNIQUE_CONSTRAINT_FIELD[getViolatedConstraint(error) ?? ''];
        if (field) {
          throw new UnprocessableEntityException({
            message: 'Validation failed',
            errors: { [field]: [`${field} já está em uso`] },
          });
        }
      }
      throw error;
    }
  }

  private assertBirthdayNotInFuture(birthdayInput: string | undefined): void {
    if (!birthdayInput) return;
    if (new Date(birthdayInput) > new Date()) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { birthdayInput: ['não pode ser uma data no futuro'] },
      });
    }
  }

  private assertValidDocuments(dto: { cpf?: string; rg?: string }): void {
    if (dto.cpf && !isValidCpf(dto.cpf)) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { cpf: ['CPF inválido'] },
      });
    }
  }

  async create(dto: CreateUserDto): Promise<User> {
    const authorizationLevel = dto.authorizationLevel ?? AuthorizationLevel.PERSON;

    if (this.isEmailRequired(authorizationLevel) && !dto.email) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { email: ['não pode ficar em branco'] },
      });
    }

    if (this.isPasswordRequired(authorizationLevel) && !dto.password) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { password: ['não pode ficar em branco'] },
      });
    }

    this.assertBirthdayNotInFuture(dto.birthdayInput);
    this.assertValidDocuments(dto);
    await this.assertUniqueEmail(dto.email || undefined);

    const user = this.usersRepository.create({
      fullName: dto.fullName,
      authorizationLevel,
      email: dto.email ?? '',
      secondaryEmail: dto.secondaryEmail ?? '',
      gender: dto.gender,
      birthday: dto.birthdayInput ?? null,
      nickname: dto.nickname ?? '',
      cpf: dto.cpf ?? '',
      rg: dto.rg ?? '',
      address: dto.address ?? '',
      celularNumber: dto.celularNumber ?? '',
      phoneNumber: dto.phoneNumber ?? '',
      companyId: dto.companyId ?? null,
      encryptedPassword: dto.password ? await bcrypt.hash(dto.password, BCRYPT_ROUNDS) : '',
    });

    return this.saveUser(user);
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResult<User>> {
    const qb = this.usersRepository.createQueryBuilder('user').orderBy('LOWER(user.full_name)', 'ASC');

    if (query.q) {
      qb.andWhere('user.full_name ILIKE :q', { q: `%${query.q}%` });
    }

    if (query.authorizationLevel !== undefined) {
      qb.andWhere('user.authorization_level = :level', { level: query.authorizationLevel });
    }

    if (query.companyId) {
      qb.andWhere('user.company_id = :companyId', { companyId: query.companyId });
    }

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    return paginate(data, total, query.page, query.per);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const authorizationLevel = dto.authorizationLevel ?? user.authorizationLevel;

    if (this.isEmailRequired(authorizationLevel) && !(dto.email ?? user.email)) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { email: ['não pode ficar em branco'] },
      });
    }

    this.assertBirthdayNotInFuture(dto.birthdayInput);
    this.assertValidDocuments(dto);
    if (dto.email && dto.email !== user.email) await this.assertUniqueEmail(dto.email, id);

    Object.assign(user, {
      fullName: dto.fullName ?? user.fullName,
      authorizationLevel,
      email: dto.email ?? user.email,
      secondaryEmail: dto.secondaryEmail ?? user.secondaryEmail,
      gender: dto.gender ?? user.gender,
      birthday: dto.birthdayInput ?? user.birthday,
      nickname: dto.nickname ?? user.nickname,
      cpf: dto.cpf ?? user.cpf,
      rg: dto.rg ?? user.rg,
      address: dto.address ?? user.address,
      celularNumber: dto.celularNumber ?? user.celularNumber,
      phoneNumber: dto.phoneNumber ?? user.phoneNumber,
      companyId: dto.companyId ?? user.companyId,
    });

    if (dto.password) {
      user.encryptedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }

    return this.saveUser(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    try {
      await this.usersRepository.remove(user);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: este usuário está vinculado a outros registros');
      }
      throw error;
    }
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.encryptedPassword) return false;
    return bcrypt.compare(password, user.encryptedPassword);
  }
}
