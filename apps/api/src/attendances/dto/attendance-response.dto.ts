import { ATTENDANCE_STATUS_LABEL } from '../enums/status.enum.js';
import { Attendance } from '../entities/attendance.entity.js';

export class AttendanceResponseDto {
  id!: string;
  eventId!: string;
  memberId!: string;
  status!: string;
  reason!: string;
  member?: { id: string; fullName: string };
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(attendance: Attendance): AttendanceResponseDto {
    const dto = new AttendanceResponseDto();
    dto.id = attendance.id;
    dto.eventId = attendance.eventId;
    dto.memberId = attendance.memberId;
    dto.status = ATTENDANCE_STATUS_LABEL[attendance.status];
    dto.reason = attendance.reason;
    if (attendance.member) dto.member = { id: attendance.member.id, fullName: attendance.member.user.fullName };
    dto.createdAt = attendance.createdAt;
    dto.updatedAt = attendance.updatedAt;
    return dto;
  }
}
