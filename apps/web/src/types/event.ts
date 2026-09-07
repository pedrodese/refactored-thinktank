/**
 * One occurrence of a Meeting, by one Team, on one date. Evento, in the
 * interface. `name` é sempre derivado do `Meeting` (nunca informado pelo
 * cliente). `pendingAssessmentsCount` vem calculado; `pendingAttendancesCount`
 * só quando a API busca o evento individual (`GET /events/:id`), não na
 * listagem.
 */
export interface Event {
  readonly id: string
  readonly name: string
  readonly date: string
  readonly teamId: string
  readonly meetingId: string
  readonly generalComments: string
  readonly itemAScore: string | null
  readonly itemAComment: string
  readonly itemBScore: string | null
  readonly itemBComment: string
  readonly itemCScore: string | null
  readonly itemCComment: string
  readonly itemDScore: string | null
  readonly itemDComment: string
  readonly pendingAssessmentsCount: number
  readonly pendingAttendancesCount?: number
  readonly createdAt: string
  readonly updatedAt: string
}
