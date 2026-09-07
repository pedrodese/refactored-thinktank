import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../attendances/entities/attendance.entity.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { Cluster } from '../clusters/entities/cluster.entity.js';
import { Meeting } from '../meetings/entities/meeting.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { Event } from './entities/event.entity.js';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Meeting, Attendance, Team, Cluster]), AuthorizationModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
