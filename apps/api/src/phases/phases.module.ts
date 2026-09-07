import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { Phase } from './entities/phase.entity.js';
import { PhaseTool } from './entities/phase-tool.entity.js';
import { PhasesController } from './phases.controller.js';
import { PhasesService } from './phases.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Phase, PhaseTool]), AuthorizationModule],
  controllers: [PhasesController],
  providers: [PhasesService],
  exports: [PhasesService],
})
export class PhasesModule {}
