/**
 * A recurring session slot within a Chapter, owned by one Facilitator.
 * Cluster, in the interface. `weekDay` chega já como label pt-BR (contrato:
 * enums sempre como string) e `name` é computado no backend
 * (`ClustersService.computeName`), nunca uma coluna.
 */
export interface Cluster {
  readonly id: string
  readonly active: boolean
  readonly address: string | null
  readonly auxiliaryFacilitatorId: string | null
  readonly chapterId: string | null
  readonly endDate: string | null
  readonly endTime: string
  readonly facilitatorId: string | null
  readonly link: string | null
  readonly startDate: string | null
  readonly startTime: string
  readonly weekDay: string
  readonly name: string
  readonly createdAt: string
  readonly updatedAt: string
}
