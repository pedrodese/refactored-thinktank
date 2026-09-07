import { Body, Controller, ForbiddenException, Get, HttpException, Param, Patch } from '@nestjs/common';
import { AttendanceResponseDto } from '../attendances/dto/attendance-response.dto.js';
import { AttendancesService } from '../attendances/attendances.service.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { EventResponseDto } from '../events/dto/event-response.dto.js';
import { EventsService } from '../events/events.service.js';
import { TeamsService } from '../teams/teams.service.js';
import { ToolEventAssessmentResponseDto } from '../tool-event-assessments/dto/tool-event-assessment-response.dto.js';
import { ToolEventAssessmentsService } from '../tool-event-assessments/tool-event-assessments.service.js';
import { BulkUpdateEventsDto } from './dto/bulk-update-events.dto.js';
import type { User } from '../users/entities/user.entity.js';

const UNPAGINATED = { page: 1, per: 1000 };

@Controller('teams/:teamId/team-bulk-evaluations')
export class TeamBulkEvaluationsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly attendancesService: AttendancesService,
    private readonly assessmentsService: ToolEventAssessmentsService,
    private readonly teamsService: TeamsService,
    private readonly authorization: AuthorizationService,
  ) {}

  private async assertCanAccess(teamId: string, currentUser: User): Promise<void> {
    if (this.authorization.canManageEvents(currentUser)) return;
    const ownership = await this.eventsService.getOwnershipForTeam(teamId);
    if (ownership && this.authorization.isClusterOwner(currentUser, ownership)) return;
    throw new ForbiddenException('Você não tem permissão para acessar as avaliações desta equipe');
  }

  private extractErrors(error: unknown): unknown {
    if (error instanceof HttpException) {
      const response = error.getResponse();
      if (typeof response === 'object' && response !== null && 'errors' in response) {
        return (response as { errors: unknown }).errors;
      }
      return response;
    }
    throw error;
  }

  @Get()
  async show(@Param('teamId') teamId: string, @CurrentUser() currentUser: User) {
    await this.assertCanAccess(teamId, currentUser);
    const team = await this.teamsService.findOne(teamId);
    const events = await this.eventsService.findAllPendingForTeam(teamId);

    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        const [attendances, toolAssessments] = await Promise.all([
          this.attendancesService.findAll(event.id, UNPAGINATED),
          this.assessmentsService.findAll(event.id, UNPAGINATED),
        ]);
        return {
          ...EventResponseDto.fromEntity(event),
          attendances: attendances.data.map(AttendanceResponseDto.fromEntity),
          toolAssessments: toolAssessments.data.map(ToolEventAssessmentResponseDto.fromEntity),
        };
      }),
    );

    return { team: { id: team.id, name: team.name }, events: eventsWithDetails };
  }

  @Patch()
  async update(@Param('teamId') teamId: string, @Body() dto: BulkUpdateEventsDto, @CurrentUser() currentUser: User) {
    await this.assertCanAccess(teamId, currentUser);

    const updated: EventResponseDto[] = [];
    const rejected: { id: string; errors: unknown }[] = [];

    for (const { id, ...fields } of dto.events) {
      try {
        const event = await this.eventsService.findOne(id);
        if (event.teamId !== teamId) {
          rejected.push({ id, errors: { teamId: ['evento não pertence a esta equipe'] } });
          continue;
        }
        const { event: updatedEvent } = await this.eventsService.update(id, fields);
        updated.push(EventResponseDto.fromEntity(updatedEvent));
      } catch (error) {
        rejected.push({ id, errors: this.extractErrors(error) });
      }
    }

    return { updated, rejected };
  }
}
