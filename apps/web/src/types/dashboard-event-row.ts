/**
 * One line of any dashboard table. The four tables show different columns of
 * it; the shape is shared because they are all the same Event seen from a
 * different angle.
 */
export interface DashboardEventRow {
  readonly id: number
  readonly name: string
  readonly date: string
  readonly today: boolean
  readonly teamName: string
  readonly clusterName: string
  readonly facilitatorName: string
  readonly facilitatorPath: string | null
  readonly path: string
  readonly editPath: string
  readonly attendancesCount: number
  readonly presentCount: number
  readonly absentCount: number
  readonly pendingAssessmentsCount: number
  readonly pendingAttendancesCount: number
}
