// Espelha `AuthorizationService.isElevated`/`canListOperations` do backend
// (`canManageClusters/Teams/Members` são só `isElevated`, sem checagem de
// propriedade — só a leitura de Cluster/Team/Member é escopada por
// facilitator dono, nunca a escrita). Isto é só uma conveniência de UI (mostra
// ou esconde botão); o servidor continua sendo a única autoridade de verdade.
const ELEVATED_LEVELS = ['admin', 'secretary', 'super_admin']
const OPERATIONS_LEVELS = ['facilitator', ...ELEVATED_LEVELS]

export function canManageOperations(authorizationLevel: string | undefined): boolean {
  return !!authorizationLevel && ELEVATED_LEVELS.includes(authorizationLevel)
}

export function canListOperations(authorizationLevel: string | undefined): boolean {
  return !!authorizationLevel && OPERATIONS_LEVELS.includes(authorizationLevel)
}

// Diferente de Cluster/Team/Member: em Event, `canManageEvents` do backend
// TAMBÉM é só `isElevated` — mas o controller combina isso com `isClusterOwner`
// (Event -> Team -> Cluster), então o facilitator dono do cluster da equipe
// do evento tem CRUD completo nele (não só leitura), inclusive em
// Attendance/ToolEventAssessment (mesma checagem lá). Isso não muda a UI:
// `GET /events`/`/teams/:id/team-bulk-evaluations` já vem escopado ao que o
// facilitador facilita, e o `GET` de um evento/presença/avaliação específica
// usa exatamente essa mesma checagem combinada — então, se a página carregou,
// quem está vendo já tem permissão de gerenciar. Só a criação (`canCreateEvent`)
// é irrestrita pro facilitator (não dá pra checar propriedade de um registro
// que ainda não existe), daí ser a única exportada aqui além do que já existia.
export function canCreateEvent(authorizationLevel: string | undefined): boolean {
  return canManageOperations(authorizationLevel) || authorizationLevel === 'facilitator'
}
