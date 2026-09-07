/**
 * A stage of the methodology, owning its Meetings and MethodologyTools. Fase,
 * in the interface. `toolIds` vem embutido na resposta (a API resolve a N:N
 * com `Tool` do lado do servidor) — sem contadores (`toolsCount`/
 * `meetingsCount`, counter cache do Rails) porque não são mantidos.
 */
export interface Phase {
  readonly id: string
  readonly name: string
  readonly toolIds: readonly string[]
  readonly createdAt: string
  readonly updatedAt: string
}
