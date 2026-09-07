/**
 * The link between a User and a Team, carrying that person's role and
 * modality. Named `Member` in the schema, which reads like a person; the
 * interface says "membro de equipe" and the front end follows the interface.
 * Sem endpoint top-level (só `/teams/:teamId/members`) — substitui
 * `types/team-membership.ts`, que era o shape antigo da listagem plana em
 * Inertia, removida nesta migração (a API não relaciona Member a User na
 * direção inversa).
 */
export interface Member {
  readonly id: string
  readonly active: boolean
  readonly modality: string | null
  readonly role: string
  readonly teamId: string
  readonly userId: string
  readonly user?: { readonly id: string; readonly fullName: string; readonly email: string }
  readonly createdAt: string
  readonly updatedAt: string
}
