/**
 * A group working one Axis inside one Cluster, across a Chapter. Equipe, in
 * the interface. `modality` é computado no backend a partir dos `Member`s
 * (todos iguais / "Híbrido" se misto / "Não definida" se vazio) — nunca uma
 * coluna. Sem `membersCount`/`activeMembersCount`/`eventsCount` (counter
 * caches do Rails, não mantidos).
 */
export interface Team {
  readonly id: string
  readonly name: string
  readonly axisId: string
  readonly clusterId: string | null
  readonly linkMiro: string
  readonly linkTeams: string
  readonly modality: string
  readonly createdAt: string
  readonly updatedAt: string
}
