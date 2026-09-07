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
import { ClustersService } from '../clusters/clusters.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { TeamQueryDto } from './dto/team-query.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { TeamsService, type TeamWithModality } from './teams.service.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly clustersService: ClustersService,
    private readonly authorization: AuthorizationService,
  ) {}

  private async assertCanRead(currentUser: User, team: TeamWithModality): Promise<void> {
    if (this.authorization.canManageTeams(currentUser)) return;
    const ownership = await this.clustersService.getOwnership(team.clusterId);
    if (ownership && this.authorization.isClusterOwner(currentUser, ownership)) return;
    throw new ForbiddenException('Você não tem permissão para ver esta equipe');
  }

  @Get()
  async findAll(@Query() query: TeamQueryDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canListOperations(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para listar equipes');
    }
    const scopeId = this.authorization.facilitatorScopeId(currentUser);
    return this.teamsService.findAll(query, scopeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const team = await this.teamsService.findOne(id);
    await this.assertCanRead(currentUser, team);
    return team;
  }

  @Post()
  create(@Body() dto: CreateTeamDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canManageTeams(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para criar equipes');
    }
    return this.teamsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canManageTeams(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para atualizar equipes');
    }
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    if (!this.authorization.canManageTeams(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para remover equipes');
    }
    await this.teamsService.remove(id);
  }
}
