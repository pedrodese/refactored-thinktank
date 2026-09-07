/**
 * A methodology instrument applied during a Meeting. Named Tool in the
 * schema, where Tool also means an LLM function call. `phaseIds` vem
 * embutido na resposta, sem contador (`phasesCount`, counter cache do Rails,
 * não mantido).
 */
export interface MethodologyTool {
  readonly id: string
  readonly name: string
  readonly phaseIds: readonly string[]
  readonly createdAt: string
  readonly updatedAt: string
}
