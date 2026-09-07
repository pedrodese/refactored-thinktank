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
import { ChaptersService } from './chapters.service.js';
import { ChapterQueryDto } from './dto/chapter-query.dto.js';
import { CreateChapterDto } from './dto/create-chapter.dto.js';
import { UpdateChapterDto } from './dto/update-chapter.dto.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('chapters')
export class ChaptersController {
  constructor(
    private readonly chaptersService: ChaptersService,
    private readonly authorization: AuthorizationService,
  ) {}

  private assertCanManage(currentUser: User): void {
    if (!this.authorization.canManageCatalog(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar capítulos');
    }
  }

  @Get()
  findAll(@Query() query: ChapterQueryDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.chaptersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.chaptersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateChapterDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.chaptersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChapterDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.chaptersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    await this.chaptersService.remove(id);
  }
}
