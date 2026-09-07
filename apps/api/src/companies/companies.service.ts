import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isForeignKeyViolation } from '../common/utils/database-error.util.js';
import { isValidCnpj } from '../common/utils/cpf-cnpj.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { QueryCompanyDto } from './dto/query-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { Company } from './entities/company.entity.js';

@Injectable()
export class CompaniesService {
  constructor(@InjectRepository(Company) private readonly companiesRepository: Repository<Company>) {}

  private assertValidCnpj(cnpj: string): void {
    if (!isValidCnpj(cnpj)) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { cnpj: ['CNPJ inválido'] },
      });
    }
  }

  // companies.cnpj não tem índice único no schema do Postgres então precisa fazer um select pra validar antes de persistir
  private async assertUniqueCnpj(cnpj: string, excludeId?: string): Promise<void> {
    const existing = await this.companiesRepository
      .createQueryBuilder('company')
      .where('company.cnpj = :cnpj', { cnpj })
      .andWhere(excludeId ? 'company.id != :excludeId' : '1=1', { excludeId })
      .getOne();

    if (existing) {
      throw new ConflictException({
        message: 'Validation failed',
        errors: { cnpj: ['CNPJ já cadastrado'] },
      });
    }
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    this.assertValidCnpj(dto.cnpj);
    await this.assertUniqueCnpj(dto.cnpj);
    const company = this.companiesRepository.create(dto);
    return this.companiesRepository.save(company);
  }

  async findAll(query: QueryCompanyDto): Promise<PaginatedResult<Company>> {
    const qb = this.companiesRepository.createQueryBuilder('company').orderBy('LOWER(company.name)', 'ASC');

    if (query.q) {
      qb.andWhere('(company.name ILIKE :q OR company.cnpj ILIKE :q)', { q: `%${query.q}%` });
    }

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    return paginate(data, total, query.page, query.per);
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    if (dto.cnpj && dto.cnpj !== company.cnpj) {
      this.assertValidCnpj(dto.cnpj);
      await this.assertUniqueCnpj(dto.cnpj, id);
    }
    Object.assign(company, dto);
    return this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    try {
      await this.companiesRepository.remove(company);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: esta empresa está vinculada a outros registros');
      }
      throw error;
    }
  }
}
