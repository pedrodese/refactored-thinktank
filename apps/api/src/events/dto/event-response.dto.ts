import { EVENT_SCORE_LABEL, type EventScore } from '../enums/event-score.enum.js';
import { Event } from '../entities/event.entity.js';

function scoreLabel(score: EventScore | null): string | null {
  return score === null ? null : EVENT_SCORE_LABEL[score];
}

export class EventResponseDto {
  id!: string;
  name!: string;
  date!: string;
  teamId!: string;
  meetingId!: string;
  generalComments!: string;
  itemAScore!: string | null;
  itemAComment!: string;
  itemBScore!: string | null;
  itemBComment!: string;
  itemCScore!: string | null;
  itemCComment!: string;
  itemDScore!: string | null;
  itemDComment!: string;
  pendingAssessmentsCount!: number;
  pendingAttendancesCount?: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(event: Event, pendingAttendancesCount?: number): EventResponseDto {
    const dto = new EventResponseDto();
    dto.id = event.id;
    dto.name = event.name;
    dto.date = event.date;
    dto.teamId = event.teamId;
    dto.meetingId = event.meetingId;
    dto.generalComments = event.generalComments;
    dto.itemAScore = scoreLabel(event.itemAScore);
    dto.itemAComment = event.itemAComment;
    dto.itemBScore = scoreLabel(event.itemBScore);
    dto.itemBComment = event.itemBComment;
    dto.itemCScore = scoreLabel(event.itemCScore);
    dto.itemCComment = event.itemCComment;
    dto.itemDScore = scoreLabel(event.itemDScore);
    dto.itemDComment = event.itemDComment;
    dto.pendingAssessmentsCount = [event.itemAScore, event.itemBScore, event.itemCScore, event.itemDScore].filter(
      (score) => score === null,
    ).length;
    if (pendingAttendancesCount !== undefined) dto.pendingAttendancesCount = pendingAttendancesCount;
    dto.createdAt = event.createdAt;
    dto.updatedAt = event.updatedAt;
    return dto;
  }
}
