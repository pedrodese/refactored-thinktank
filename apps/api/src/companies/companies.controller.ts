import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CompaniesService } from './companies.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { QueryCompanyDto } from './dto/query-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly authorization: AuthorizationService,
  ) {}

  private assertCanManage(currentUser: User): void {
    if (!this.authorization.canManageCompanies(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar empresas');
    }
  }

  @Get()
  findAll(@Query() query: QueryCompanyDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.companiesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCompanyDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.companiesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    await this.companiesService.remove(id);
  }
}
