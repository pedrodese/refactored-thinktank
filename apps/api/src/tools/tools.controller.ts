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
import { CreateToolDto } from './dto/create-tool.dto.js';
import { ToolQueryDto } from './dto/tool-query.dto.js';
import { UpdateToolDto } from './dto/update-tool.dto.js';
import { ToolsService } from './tools.service.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('tools')
export class ToolsController {
  constructor(
    private readonly toolsService: ToolsService,
    private readonly authorization: AuthorizationService,
  ) {}

  private assertCanManage(currentUser: User): void {
    if (!this.authorization.canManageCatalog(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar ferramentas');
    }
  }

  @Get()
  findAll(@Query() query: ToolQueryDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.toolsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.toolsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateToolDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.toolsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateToolDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.toolsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    await this.toolsService.remove(id);
  }
}
