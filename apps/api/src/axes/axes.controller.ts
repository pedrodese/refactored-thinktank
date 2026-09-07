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
import { AxesService } from './axes.service.js';
import { AxisQueryDto } from './dto/axis-query.dto.js';
import { CreateAxisDto } from './dto/create-axis.dto.js';
import { UpdateAxisDto } from './dto/update-axis.dto.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('axes')
export class AxesController {
  constructor(
    private readonly axesService: AxesService,
    private readonly authorization: AuthorizationService,
  ) {}

  private assertCanManage(currentUser: User): void {
    if (!this.authorization.canManageCatalog(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar eixos');
    }
  }

  @Get()
  findAll(@Query() query: AxisQueryDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.axesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.axesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAxisDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.axesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAxisDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.axesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    await this.axesService.remove(id);
  }
}
