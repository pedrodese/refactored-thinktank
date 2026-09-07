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
import { CreatePhaseDto } from './dto/create-phase.dto.js';
import { PhaseQueryDto } from './dto/phase-query.dto.js';
import { UpdatePhaseDto } from './dto/update-phase.dto.js';
import { PhasesService } from './phases.service.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('phases')
export class PhasesController {
  constructor(
    private readonly phasesService: PhasesService,
    private readonly authorization: AuthorizationService,
  ) {}

  private assertCanManage(currentUser: User): void {
    if (!this.authorization.canManageCatalog(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar fases');
    }
  }

  @Get()
  findAll(@Query() query: PhaseQueryDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.phasesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.phasesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePhaseDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.phasesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePhaseDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.phasesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    await this.phasesService.remove(id);
  }
}
