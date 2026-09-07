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
import { CreateEventDto } from './dto/create-event.dto.js';
import { EventQueryDto } from './dto/event-query.dto.js';
import { EventResponseDto } from './dto/event-response.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { Event } from './entities/event.entity.js';
import { EventsService } from './events.service.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly authorization: AuthorizationService,
  ) {}

  private async assertCanManage(currentUser: User, event: Event): Promise<void> {
    if (this.authorization.canManageEvents(currentUser)) return;
    const ownership = await this.eventsService.getOwnershipForTeam(event.teamId);
    if (ownership && this.authorization.isClusterOwner(currentUser, ownership)) return;
    throw new ForbiddenException('Você não tem permissão para acessar este evento');
  }

  @Get()
  async findAll(@Query() query: EventQueryDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canListOperations(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para listar eventos');
    }
    const scopeId = this.authorization.facilitatorScopeId(currentUser);
    const result = await this.eventsService.findAll(query, scopeId);
    return { ...result, data: result.data.map((event) => EventResponseDto.fromEntity(event)) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const event = await this.eventsService.findOne(id);
    await this.assertCanManage(currentUser, event);
    const pendingAttendancesCount = await this.eventsService.getPendingAttendancesCount(id);
    return EventResponseDto.fromEntity(event, pendingAttendancesCount);
  }

  @Post()
  async create(@Body() dto: CreateEventDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canCreateEvent(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para criar eventos');
    }
    const event = await this.eventsService.create(dto);
    return EventResponseDto.fromEntity(event);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto, @CurrentUser() currentUser: User) {
    const existing = await this.eventsService.findOne(id);
    await this.assertCanManage(currentUser, existing);
    const { event, nextPendingEvent } = await this.eventsService.update(id, dto);
    return {
      event: EventResponseDto.fromEntity(event),
      nextPendingEvent: nextPendingEvent ? EventResponseDto.fromEntity(nextPendingEvent) : null,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const event = await this.eventsService.findOne(id);
    await this.assertCanManage(currentUser, event);
    await this.eventsService.remove(id);
  }
}
