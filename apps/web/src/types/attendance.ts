/** Whether one Member was at one Event. Presença, in the interface. */
export interface Attendance {
  readonly id: string
  readonly eventId: string
  readonly memberId: string
  readonly status: string
  readonly reason: string
  readonly member?: { readonly id: string; readonly fullName: string }
  readonly createdAt: string
  readonly updatedAt: string
}
