import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { EventsModule } from '../events/events.module.js';
import { ToolEventAssessment } from './entities/tool-event-assessment.entity.js';
import { ToolEventAssessmentsController } from './tool-event-assessments.controller.js';
import { ToolEventAssessmentsService } from './tool-event-assessments.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ToolEventAssessment]), EventsModule, AuthorizationModule],
  controllers: [ToolEventAssessmentsController],
  providers: [ToolEventAssessmentsService],
  exports: [ToolEventAssessmentsService],
})
export class ToolEventAssessmentsModule {}
