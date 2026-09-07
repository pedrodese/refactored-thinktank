import { Controller, ForbiddenException, Get, Header, Query } from '@nestjs/common';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PendingAssessmentsQueryDto } from './dto/pending-assessments-query.dto.js';
import { ReportsService } from './reports.service.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly authorization: AuthorizationService,
  ) {}

  // Relatório restrito ao time interno — ver ReportsService pra racional
  // completo da simplificação em relação ao Rails.
  @Get('pending-assessments.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async pendingAssessments(@Query() query: PendingAssessmentsQueryDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canManageEvents(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para exportar este relatório');
    }
    return this.reportsService.buildPendingAssessmentsCsv(query.clusterStatus ?? 'active');
  }
}
