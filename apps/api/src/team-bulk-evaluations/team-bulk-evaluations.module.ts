import { Module } from '@nestjs/common';
import { AttendancesModule } from '../attendances/attendances.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { EventsModule } from '../events/events.module.js';
import { TeamsModule } from '../teams/teams.module.js';
import { ToolEventAssessmentsModule } from '../tool-event-assessments/tool-event-assessments.module.js';
import { TeamBulkEvaluationsController } from './team-bulk-evaluations.controller.js';

@Module({
  imports: [EventsModule, AttendancesModule, ToolEventAssessmentsModule, TeamsModule, AuthorizationModule],
  controllers: [TeamBulkEvaluationsController],
})
export class TeamBulkEvaluationsModule {}
