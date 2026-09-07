/**
 * A meeting the methodology defines, owned by a Phase — the template, not an
 * occurrence. Só `phaseId` vem na resposta (a API não carrega a relação) —
 * o nome da fase precisa ser resolvido pelo cliente a partir de `/phases`.
 */
export interface Meeting {
  readonly id: string
  readonly name: string
  readonly abbreviation: string
  readonly phaseId: string | null
  readonly createdAt: string
  readonly updatedAt: string
}
