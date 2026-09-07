/**
 * One MethodologyTool's assessment within one Event. Sem tela própria no
 * Rails original (era editado só como nested-attributes dentro do form de
 * Event) — aqui vira sub-recurso com CRUD próprio, gerido a partir de
 * `events/show`, mesmo padrão de `Member` em `teams/show`.
 */
export interface ToolEventAssessment {
  readonly id: string
  readonly eventId: string
  readonly toolId: string
  readonly score: string
  readonly comment: string
  readonly tool?: { readonly id: string; readonly name: string | null }
  readonly createdAt: string
  readonly updatedAt: string
}
