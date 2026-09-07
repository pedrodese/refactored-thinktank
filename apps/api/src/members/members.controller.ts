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
import { TeamsService } from '../teams/teams.service.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { MemberQueryDto } from './dto/member-query.dto.js';
import { MemberResponseDto } from './dto/member-response.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { MembersService } from './members.service.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('teams/:teamId/members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly teamsService: TeamsService,
    private readonly clustersService: ClustersService,
    private readonly authorization: AuthorizationService,
  ) {}

  private assertCanManage(currentUser: User): void {
    if (!this.authorization.canManageMembers(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar membros');
    }
  }

  private async assertCanRead(teamId: string, currentUser: User): Promise<void> {
    if (this.authorization.canManageMembers(currentUser)) return;
    const team = await this.teamsService.findOne(teamId);
    const ownership = await this.clustersService.getOwnership(team.clusterId);
    if (ownership && this.authorization.isClusterOwner(currentUser, ownership)) return;
    throw new ForbiddenException('Você não tem permissão para ver os membros desta equipe');
  }

  @Get()
  async findAll(@Param('teamId') teamId: string, @Query() query: MemberQueryDto, @CurrentUser() currentUser: User) {
    await this.assertCanRead(teamId, currentUser);
    const result = await this.membersService.findAll(teamId, query);
    return { ...result, data: result.data.map(MemberResponseDto.fromEntity) };
  }

  @Get(':id')
  async findOne(@Param('teamId') teamId: string, @Param('id') id: string, @CurrentUser() currentUser: User) {
    await this.assertCanRead(teamId, currentUser);
    const member = await this.membersService.findOne(teamId, id);
    return MemberResponseDto.fromEntity(member);
  }

  @Post()
  async create(@Param('teamId') teamId: string, @Body() dto: CreateMemberDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    await this.teamsService.findOne(teamId);
    const member = await this.membersService.create(teamId, dto);
    return MemberResponseDto.fromEntity(member);
  }

  @Patch(':id')
  async update(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() currentUser: User,
  ) {
    this.assertCanManage(currentUser);
    const member = await this.membersService.update(teamId, id, dto);
    return MemberResponseDto.fromEntity(member);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('teamId') teamId: string, @Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    await this.membersService.remove(teamId, id);
  }
}
