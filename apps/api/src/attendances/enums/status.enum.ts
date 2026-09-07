// Ordem exata de app/models/attendance.rb (enum :status, %i[not_registered
// present absent]) — não reordenar.
export enum AttendanceStatus {
  NOT_REGISTERED = 0,
  PRESENT = 1,
  ABSENT = 2,
}

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  [AttendanceStatus.NOT_REGISTERED]: 'not_registered',
  [AttendanceStatus.PRESENT]: 'present',
  [AttendanceStatus.ABSENT]: 'absent',
};
