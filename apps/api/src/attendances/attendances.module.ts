import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { EventsModule } from '../events/events.module.js';
import { Attendance } from './entities/attendance.entity.js';
import { AttendancesController } from './attendances.controller.js';
import { AttendancesService } from './attendances.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), EventsModule, AuthorizationModule],
  controllers: [AttendancesController],
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
