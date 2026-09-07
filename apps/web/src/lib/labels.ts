import type { Labeled } from '@/types/labeled'

// A API expõe os enums como string (contrato) mas espera o valor numérico de
// volta no create/update — os mapas aqui cobrem os dois sentidos. Ordem/
// valores espelham exatamente os enums do backend (users/enums), não
// reordenar.
export const AUTHORIZATION_LEVEL_LABEL: Record<string, string> = {
  person: 'Pessoa',
  secretary: 'Secretaria',
  facilitator: 'Facilitador',
  admin: 'Admin',
  super_admin: 'Super admin',
}

export const AUTHORIZATION_LEVEL_OPTIONS: readonly Labeled<string>[] = [
  { value: '0', label: 'Pessoa' },
  { value: '1', label: 'Secretaria' },
  { value: '2', label: 'Facilitador' },
  { value: '3', label: 'Admin' },
  { value: '4', label: 'Super admin' },
]

const AUTHORIZATION_LEVEL_STRING_TO_VALUE: Record<string, string> = {
  person: '0',
  secretary: '1',
  facilitator: '2',
  admin: '3',
  super_admin: '4',
}

export function authorizationLevelToFormValue(level: string): string {
  return AUTHORIZATION_LEVEL_STRING_TO_VALUE[level] ?? '0'
}

export const GENDER_LABEL: Record<string, string> = {
  man: 'Homem',
  woman: 'Mulher',
  other: 'Outro',
}

export const GENDER_OPTIONS: readonly Labeled<string>[] = [
  { value: '0', label: 'Homem' },
  { value: '1', label: 'Mulher' },
  { value: '2', label: 'Outro' },
]

const GENDER_STRING_TO_VALUE: Record<string, string> = { man: '0', woman: '1', other: '2' }

export function genderToFormValue(gender: string): string {
  return GENDER_STRING_TO_VALUE[gender] ?? '2'
}

// Mesmo intervalo fechado de `chapters.constants.ts` no backend
// (EDITION_YEARS, 2023–2030, espelhando app/models/chapter.rb) — não
// reordenar/estender sem mexer nos dois lados.
export const EDITION_YEAR_OPTIONS: readonly Labeled<string>[] = Array.from({ length: 2030 - 2023 + 1 }, (_, i) => {
  const year = 2023 + i
  return { value: String(year), label: String(year) }
})

// Espelha `clusters/enums/week-day.enum.ts` (ordem exata de app/models/cluster.rb).
export const WEEK_DAY_OPTIONS: readonly Labeled<string>[] = [
  { value: '0', label: 'Segunda' },
  { value: '1', label: 'Terça' },
  { value: '2', label: 'Quarta' },
  { value: '3', label: 'Quinta' },
  { value: '4', label: 'Sexta' },
  { value: '5', label: 'Sábado' },
  { value: '6', label: 'Domingo' },
]

const WEEK_DAY_STRING_TO_VALUE: Record<string, string> = {
  segunda: '0',
  terca: '1',
  quarta: '2',
  quinta: '3',
  sexta: '4',
  sabado: '5',
  domingo: '6',
}

export function weekDayToFormValue(weekDay: string): string {
  return WEEK_DAY_STRING_TO_VALUE[weekDay] ?? '0'
}

export const CLUSTER_STATUS_OPTIONS: readonly Labeled<string>[] = [
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'all', label: 'Todos' },
]

export const MEMBER_MODALITY_LABEL: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
}

// Espelha `members/enums/modality.enum.ts` (ordem exata de app/models/member.rb).
export const MEMBER_MODALITY_OPTIONS: readonly Labeled<string>[] = [
  { value: '0', label: 'Presencial' },
  { value: '1', label: 'Online' },
  { value: '2', label: 'Híbrido' },
]

const MEMBER_MODALITY_STRING_TO_VALUE: Record<string, string> = { presencial: '0', online: '1', hibrido: '2' }

export function memberModalityToFormValue(modality: string | null): string {
  return modality ? (MEMBER_MODALITY_STRING_TO_VALUE[modality] ?? '0') : '0'
}

export const MEMBER_ROLE_LABEL: Record<string, string> = {
  mm: 'MM',
  mp: 'MP',
  sol: 'SOL',
}

// Espelha `members/enums/role.enum.ts` (ordem exata de app/models/member.rb,
// default de aplicação SOL — não o 0/mm do default da coluna no Postgres).
export const MEMBER_ROLE_OPTIONS: readonly Labeled<string>[] = [
  { value: '0', label: 'MM' },
  { value: '1', label: 'MP' },
  { value: '2', label: 'SOL' },
]

const MEMBER_ROLE_STRING_TO_VALUE: Record<string, string> = { mm: '0', mp: '1', sol: '2' }

export function memberRoleToFormValue(role: string): string {
  return MEMBER_ROLE_STRING_TO_VALUE[role] ?? '2'
}

export const EVENT_SCORE_LABEL: Record<string, string> = {
  pessimo: 'Péssimo',
  ruim: 'Ruim',
  bom: 'Bom',
  otimo: 'Ótimo',
  satisfatorio: 'Satisfatório',
  nao_se_aplica: 'Não se aplica',
}

// Espelha `events/enums/event-score.enum.ts` — inclui "não se aplica",
// diferente do score de ToolEventAssessment (ver abaixo).
export const EVENT_SCORE_OPTIONS: readonly Labeled<string>[] = [
  { value: '0', label: 'Péssimo' },
  { value: '1', label: 'Ruim' },
  { value: '2', label: 'Bom' },
  { value: '3', label: 'Ótimo' },
  { value: '4', label: 'Satisfatório' },
  { value: '5', label: 'Não se aplica' },
]

const EVENT_SCORE_STRING_TO_VALUE: Record<string, string> = {
  pessimo: '0',
  ruim: '1',
  bom: '2',
  otimo: '3',
  satisfatorio: '4',
  nao_se_aplica: '5',
}

export function eventScoreToFormValue(score: string | null): string {
  return score ? (EVENT_SCORE_STRING_TO_VALUE[score] ?? '') : ''
}

// Espelha `tool-event-assessments/enums/tool-assessment-score.enum.ts` — SEM
// "não se aplica", cuidado ao reaproveitar de `EVENT_SCORE_OPTIONS`.
export const TOOL_ASSESSMENT_SCORE_OPTIONS: readonly Labeled<string>[] = [
  { value: '0', label: 'Péssimo' },
  { value: '1', label: 'Ruim' },
  { value: '2', label: 'Bom' },
  { value: '3', label: 'Ótimo' },
  { value: '4', label: 'Satisfatório' },
]

export function toolAssessmentScoreToFormValue(score: string): string {
  return EVENT_SCORE_STRING_TO_VALUE[score] ?? '0'
}

export const ATTENDANCE_STATUS_LABEL: Record<string, string> = {
  not_registered: 'Não registrada',
  present: 'Presente',
  absent: 'Ausente',
}

// Espelha `attendances/enums/status.enum.ts`.
export const ATTENDANCE_STATUS_OPTIONS: readonly Labeled<string>[] = [
  { value: '0', label: 'Não registrada' },
  { value: '1', label: 'Presente' },
  { value: '2', label: 'Ausente' },
]

const ATTENDANCE_STATUS_STRING_TO_VALUE: Record<string, string> = { not_registered: '0', present: '1', absent: '2' }

export function attendanceStatusToFormValue(status: string): string {
  return ATTENDANCE_STATUS_STRING_TO_VALUE[status] ?? '0'
}
