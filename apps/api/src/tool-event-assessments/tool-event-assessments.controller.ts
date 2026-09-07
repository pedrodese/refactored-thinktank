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
import { CreateToolEventAssessmentDto } from './dto/create-tool-event-assessment.dto.js';
import { ToolEventAssessmentQueryDto } from './dto/tool-event-assessment-query.dto.js';
import { ToolEventAssessmentResponseDto } from './dto/tool-event-assessment-response.dto.js';
import { UpdateToolEventAssessmentDto } from './dto/update-tool-event-assessment.dto.js';
import { ToolEventAssessmentsService } from './tool-event-assessments.service.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('events/:eventId/tool-event-assessments')
export class ToolEventAssessmentsController {
  constructor(
    private readonly assessmentsService: ToolEventAssessmentsService,
    private readonly eventsService: EventsService,
    private readonly authorization: AuthorizationService,
  ) {}

  private async assertCanAccess(eventId: string, currentUser: User): Promise<void> {
    if (this.authorization.canManageEvents(currentUser)) return;
    const event = await this.eventsService.findOne(eventId);
    const ownership = await this.eventsService.getOwnershipForTeam(event.teamId);
    if (ownership && this.authorization.isClusterOwner(currentUser, ownership)) return;
    throw new ForbiddenException('Você não tem permissão para acessar as avaliações de ferramenta deste evento');
  }

  @Get()
  async findAll(
    @Param('eventId') eventId: string,
    @Query() query: ToolEventAssessmentQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.assertCanAccess(eventId, currentUser);
    const result = await this.assessmentsService.findAll(eventId, query);
    return { ...result, data: result.data.map(ToolEventAssessmentResponseDto.fromEntity) };
  }

  @Get(':id')
  async findOne(@Param('eventId') eventId: string, @Param('id') id: string, @CurrentUser() currentUser: User) {
    await this.assertCanAccess(eventId, currentUser);
    const assessment = await this.assessmentsService.findOne(eventId, id);
    return ToolEventAssessmentResponseDto.fromEntity(assessment);
  }

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateToolEventAssessmentDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.assertCanAccess(eventId, currentUser);
    const assessment = await this.assessmentsService.create(eventId, dto);
    return ToolEventAssessmentResponseDto.fromEntity(assessment);
  }

  @Patch(':id')
  async update(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: UpdateToolEventAssessmentDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.assertCanAccess(eventId, currentUser);
    const assessment = await this.assessmentsService.update(eventId, id, dto);
    return ToolEventAssessmentResponseDto.fromEntity(assessment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('eventId') eventId: string, @Param('id') id: string, @CurrentUser() currentUser: User) {
    await this.assertCanAccess(eventId, currentUser);
    await this.assessmentsService.remove(eventId, id);
  }
}
