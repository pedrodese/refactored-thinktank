import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { Axis } from './entities/axis.entity.js';
import { AxesController } from './axes.controller.js';
import { AxesService } from './axes.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Axis]), AuthorizationModule],
  controllers: [AxesController],
  providers: [AxesService],
  exports: [AxesService],
})
export class AxesModule {}
