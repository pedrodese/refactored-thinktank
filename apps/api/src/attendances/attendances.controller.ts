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
import { EventsService } from '../events/events.service.js';
import { AttendancesService } from './attendances.service.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto.js';
import { AttendanceResponseDto } from './dto/attendance-response.dto.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('events/:eventId/attendances')
export class AttendancesController {
  constructor(
    private readonly attendancesService: AttendancesService,
    private readonly eventsService: EventsService,
    private readonly authorization: AuthorizationService,
  ) {}

  // ability.rb dá `can :manage, Attendance` (não só `:read`) pro facilitator
  // escopado ao próprio Cluster — mesma checagem pra leitura e escrita aqui.
  private async assertCanAccess(eventId: string, currentUser: User): Promise<void> {
    if (this.authorization.canManageEvents(currentUser)) return;
    const event = await this.eventsService.findOne(eventId);
    const ownership = await this.eventsService.getOwnershipForTeam(event.teamId);
    if (ownership && this.authorization.isClusterOwner(currentUser, ownership)) return;
    throw new ForbiddenException('Você não tem permissão para acessar as presenças deste evento');
  }

  @Get()
  async findAll(
    @Param('eventId') eventId: string,
    @Query() query: AttendanceQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.assertCanAccess(eventId, currentUser);
    const result = await this.attendancesService.findAll(eventId, query);
    return { ...result, data: result.data.map(AttendanceResponseDto.fromEntity) };
  }

  @Get(':id')
  async findOne(@Param('eventId') eventId: string, @Param('id') id: string, @CurrentUser() currentUser: User) {
    await this.assertCanAccess(eventId, currentUser);
    const attendance = await this.attendancesService.findOne(eventId, id);
    return AttendanceResponseDto.fromEntity(attendance);
  }

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateAttendanceDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.assertCanAccess(eventId, currentUser);
    const attendance = await this.attendancesService.create(eventId, dto);
    return AttendanceResponseDto.fromEntity(attendance);
  }

  @Patch(':id')
  async update(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.assertCanAccess(eventId, currentUser);
    const attendance = await this.attendancesService.update(eventId, id, dto);
    return AttendanceResponseDto.fromEntity(attendance);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceStatusDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.assertCanAccess(eventId, currentUser);
    const attendance = await this.attendancesService.updateStatus(eventId, id, dto.status);
    return AttendanceResponseDto.fromEntity(attendance);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('eventId') eventId: string, @Param('id') id: string, @CurrentUser() currentUser: User) {
    await this.assertCanAccess(eventId, currentUser);
    await this.attendancesService.remove(eventId, id);
  }
}
