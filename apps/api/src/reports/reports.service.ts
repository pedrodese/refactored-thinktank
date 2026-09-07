import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { toCsv } from '../common/utils/csv.util.js';
import { AttendanceStatus } from '../attendances/enums/status.enum.js';
import { Attendance } from '../attendances/entities/attendance.entity.js';
import { Cluster } from '../clusters/entities/cluster.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { Team } from '../teams/entities/team.entity.js';

const PENDING_SCORE_CLAUSE =
  '(event.item_a_score IS NULL OR event.item_b_score IS NULL OR event.item_c_score IS NULL OR event.item_d_score IS NULL ' +
  'OR EXISTS (SELECT 1 FROM attendances a WHERE a.event_id = event.id AND a.status = 0))';

export type ClusterStatus = 'active' | 'inactive' | 'all';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Cluster) private readonly clustersRepository: Repository<Cluster>,
    @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Attendance) private readonly attendancesRepository: Repository<Attendance>,
  ) {}

  // Simplificação deliberada de Event.pending_assessment_not_facilitated_by:
  // não replica a exclusão "não facilitado pelo usuário atual" (só relevante
  // pro caso raro de um admin que também é facilitador de algum cluster) —
  // aqui o relatório é só pro time interno, mostrando todas as pendências
  // dos clusters no status pedido.
  async buildPendingAssessmentsCsv(clusterStatus: ClusterStatus): Promise<string> {
    const clusterWhere = clusterStatus === 'all' ? {} : { active: clusterStatus !== 'inactive' };
    const clusters = await this.clustersRepository.find({ where: clusterWhere, relations: ['facilitator'] });
    const clusterIds = clusters.map((cluster) => cluster.id);
    const facilitatorNameByClusterId = new Map(
      clusters.map((cluster) => [cluster.id, cluster.facilitator?.fullName ?? '']),
    );

    const teams = clusterIds.length
      ? await this.teamsRepository.find({ where: { clusterId: In(clusterIds) } })
      : [];
    const teamIds = teams.map((team) => team.id);
    const teamById = new Map(teams.map((team) => [team.id, team]));

    const today = new Date().toISOString().slice(0, 10);
    const events = teamIds.length
      ? await this.eventsRepository
          .createQueryBuilder('event')
          .where('event.team_id IN (:...teamIds)', { teamIds })
          .andWhere('event.date <= :today', { today })
          .andWhere(PENDING_SCORE_CLAUSE)
          .orderBy('event.date', 'ASC')
          .getMany()
      : [];

    const eventIds = events.map((event) => event.id);
    const pendingAttendancesByEventId = await this.countPendingAttendancesByEvent(eventIds);

    const rows = events.map((event) => {
      const team = teamById.get(event.teamId);
      const facilitatorName = team ? (facilitatorNameByClusterId.get(team.clusterId ?? '') ?? '') : '';
      const pendingAssessments = [event.itemAScore, event.itemBScore, event.itemCScore, event.itemDScore].filter(
        (score) => score === null,
      ).length;

      return [
        event.name,
        event.date,
        team?.name ?? '',
        facilitatorName,
        pendingAssessments,
        pendingAttendancesByEventId.get(event.id) ?? 0,
      ];
    });

    return toCsv(['Evento', 'Data', 'Equipe', 'Facilitador', 'Avaliações Pendentes', 'Presenças Pendentes'], rows);
  }

  private async countPendingAttendancesByEvent(eventIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (eventIds.length === 0) return map;

    const rows = await this.attendancesRepository
      .createQueryBuilder('attendance')
      .select('attendance.event_id', 'eventId')
      .addSelect('COUNT(*)', 'count')
      .where('attendance.event_id IN (:...eventIds)', { eventIds })
      .andWhere('attendance.status = :status', { status: AttendanceStatus.NOT_REGISTERED })
      .groupBy('attendance.event_id')
      .getRawMany<{ eventId: string; count: string }>();

    for (const row of rows) map.set(row.eventId, Number(row.count));
    return map;
  }
}
