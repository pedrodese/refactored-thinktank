import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { PhaseTool } from '../phases/entities/phase-tool.entity.js';
import { Tool } from './entities/tool.entity.js';
import { ToolsController } from './tools.controller.js';
import { ToolsService } from './tools.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Tool, PhaseTool]), AuthorizationModule],
  controllers: [ToolsController],
  providers: [ToolsService],
  exports: [ToolsService],
})
export class ToolsModule {}
