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
import { ClustersService, type ClusterWithName } from './clusters.service.js';
import { ClusterQueryDto } from './dto/cluster-query.dto.js';
import { ClusterResponseDto } from './dto/cluster-response.dto.js';
import { CreateClusterDto } from './dto/create-cluster.dto.js';
import { UpdateClusterDto } from './dto/update-cluster.dto.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('clusters')
export class ClustersController {
  constructor(
    private readonly clustersService: ClustersService,
    private readonly authorization: AuthorizationService,
  ) {}

  private assertCanRead(currentUser: User, cluster: ClusterWithName): void {
    if (this.authorization.canManageClusters(currentUser)) return;
    if (this.authorization.isClusterOwner(currentUser, cluster)) return;
    throw new ForbiddenException('Você não tem permissão para ver este cluster');
  }

  @Get()
  async findAll(@Query() query: ClusterQueryDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canListOperations(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para listar clusters');
    }
    const scopeId = this.authorization.facilitatorScopeId(currentUser);
    const result = await this.clustersService.findAll(query, scopeId);
    return { ...result, data: result.data.map(ClusterResponseDto.fromEntity) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const cluster = await this.clustersService.findOne(id);
    this.assertCanRead(currentUser, cluster);
    return ClusterResponseDto.fromEntity(cluster);
  }

  @Post()
  async create(@Body() dto: CreateClusterDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canManageClusters(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para criar clusters');
    }
    const cluster = await this.clustersService.create(dto);
    return ClusterResponseDto.fromEntity(cluster);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateClusterDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canManageClusters(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para atualizar clusters');
    }
    const cluster = await this.clustersService.update(id, dto);
    return ClusterResponseDto.fromEntity(cluster);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    if (!this.authorization.canManageClusters(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para remover clusters');
    }
    await this.clustersService.remove(id);
  }
}
