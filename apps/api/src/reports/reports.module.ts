import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../attendances/entities/attendance.entity.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { Cluster } from '../clusters/entities/cluster.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cluster, Team, Event, Attendance]), AuthorizationModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
