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
import { CreateMeetingDto } from './dto/create-meeting.dto.js';
import { MeetingQueryDto } from './dto/meeting-query.dto.js';
import { UpdateMeetingDto } from './dto/update-meeting.dto.js';
import { MeetingsService } from './meetings.service.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('meetings')
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly authorization: AuthorizationService,
  ) {}

  private assertCanManage(currentUser: User): void {
    if (!this.authorization.canManageCatalog(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar reuniões');
    }
  }

  @Get()
  findAll(@Query() query: MeetingQueryDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.meetingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.meetingsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMeetingDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.meetingsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    return this.meetingsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.assertCanManage(currentUser);
    await this.meetingsService.remove(id);
  }
}
