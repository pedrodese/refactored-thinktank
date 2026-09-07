import type { ClusterWithName } from '../clusters.service.js';
import { WEEK_DAY_LABEL } from '../enums/week-day.enum.js';

export class ClusterResponseDto {
  id!: string;
  active!: boolean;
  address!: string | null;
  auxiliaryFacilitatorId!: string | null;
  chapterId!: string | null;
  endDate!: string | null;
  endTime!: string;
  facilitatorId!: string | null;
  link!: string | null;
  startDate!: string | null;
  startTime!: string;
  weekDay!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(cluster: ClusterWithName): ClusterResponseDto {
    const dto = new ClusterResponseDto();
    dto.id = cluster.id;
    dto.active = cluster.active;
    dto.address = cluster.address;
    dto.auxiliaryFacilitatorId = cluster.auxiliaryFacilitatorId;
    dto.chapterId = cluster.chapterId;
    dto.endDate = cluster.endDate;
    dto.endTime = cluster.endTime;
    dto.facilitatorId = cluster.facilitatorId;
    dto.link = cluster.link;
    dto.startDate = cluster.startDate;
    dto.startTime = cluster.startTime;
    dto.weekDay = WEEK_DAY_LABEL[cluster.weekDay];
    dto.name = cluster.name;
    dto.createdAt = cluster.createdAt;
    dto.updatedAt = cluster.updatedAt;
    return dto;
  }
}
