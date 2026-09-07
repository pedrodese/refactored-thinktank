import { Link } from 'react-router-dom'
import { SelectField } from '@/components/select-field'
import { TextAreaField } from '@/components/text-area-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EVENT_SCORE_OPTIONS } from '@/lib/labels'
import type { Attendance } from '@/types/attendance'
import type { Event } from '@/types/event'
import type { ToolEventAssessment } from '@/types/tool-event-assessment'

const COMMENT_LIMIT = 280

const CRITERIA = [
  { key: 'A', label: 'Participação dos membros' },
  { key: 'B', label: 'Desenvolvimento do projeto' },
  { key: 'C', label: 'Relacionamento da equipe' },
  { key: 'D', label: 'Comprometimento com prazos' },
] as const

export interface BulkEvent extends Event {
  readonly attendances: readonly Attendance[]
  readonly toolAssessments: readonly ToolEventAssessment[]
}

interface CriteriaMap {
  A: string
  B: string
  C: string
  D: string
}

export interface EditState {
  scores: CriteriaMap
  comments: CriteriaMap
  generalComments: string
}

export interface BulkEditPayload {
  generalComments: string
  itemAScore?: number
  itemAComment: string
  itemBScore?: number
  itemBComment: string
  itemCScore?: number
  itemCComment: string
  itemDScore?: number
  itemDComment: string
}

export function buildEditState(event: BulkEvent): EditState {
  return {
    scores: {
      A: event.itemAScore ? scoreToValue(event.itemAScore) : '',
      B: event.itemBScore ? scoreToValue(event.itemBScore) : '',
      C: event.itemCScore ? scoreToValue(event.itemCScore) : '',
      D: event.itemDScore ? scoreToValue(event.itemDScore) : '',
    },
    comments: { A: event.itemAComment, B: event.itemBComment, C: event.itemCComment, D: event.itemDComment },
    generalComments: event.generalComments,
  }
}

export function buildPayload(edit: EditState): BulkEditPayload {
  const payload: BulkEditPayload = {
    generalComments: edit.generalComments,
    itemAComment: edit.comments.A,
    itemBComment: edit.comments.B,
    itemCComment: edit.comments.C,
    itemDComment: edit.comments.D,
  }
  if (edit.scores.A) payload.itemAScore = Number(edit.scores.A)
  if (edit.scores.B) payload.itemBScore = Number(edit.scores.B)
  if (edit.scores.C) payload.itemCScore = Number(edit.scores.C)
  if (edit.scores.D) payload.itemDScore = Number(edit.scores.D)
  return payload
}

const SCORE_STRING_TO_VALUE: Record<string, string> = {
  pessimo: '0',
  ruim: '1',
  bom: '2',
  otimo: '3',
  satisfatorio: '4',
  nao_se_aplica: '5',
}

function scoreToValue(score: string): string {
  return SCORE_STRING_TO_VALUE[score] ?? ''
}

interface Props {
  event: BulkEvent
  edit: EditState
  onChange: (changes: Partial<EditState>) => void
  errors: Record<string, string[]> | undefined
  isSubmitting: boolean
  onSaveOnly: () => void
}

// Só os 4 critérios + comentários gerais são editáveis aqui — attendances e
// tool-event-assessments são sub-recursos próprios (`/events/:id/attendances`,
// `/events/:id/tool-event-assessments`), não aninham no PATCH em lote
// (`BulkUpdateEventsDto` do backend só aceita os campos de avaliação). Ficam
// mostrados como contexto de leitura, com link pra gerir de verdade.
export function EventAssessmentCard({ event, edit, onChange, errors, isSubmitting, onSaveOnly }: Props) {
  const errorFor = (field: string) => errors?.[field]?.[0]
  const notRegisteredCount = event.attendances.filter((attendance) => attendance.status === 'not_registered').length

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">
            {event.name} — {event.date}
          </h2>
          <p className="text-sm text-muted-foreground">
            Uma nota péssima, ruim ou não se aplica exige o comentário do critério.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {CRITERIA.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-4 rounded-md border border-border p-4">
              <SelectField
                id={`bulk-event-${event.id}-item-${key}-score`}
                label={label}
                options={EVENT_SCORE_OPTIONS}
                value={edit.scores[key]}
                onChange={(value) => onChange({ scores: { ...edit.scores, [key]: value } })}
                blankLabel="Sem nota"
                error={errorFor(`item${key}Score`)}
              />
              <TextAreaField
                id={`bulk-event-${event.id}-item-${key}-comment`}
                label="Comentário"
                value={edit.comments[key]}
                onChange={(value) => onChange({ comments: { ...edit.comments, [key]: value } })}
                maxLength={COMMENT_LIMIT}
                error={errorFor(`item${key}Comment`)}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <TextAreaField
              id={`bulk-event-${event.id}-general-comments`}
              label="Comentários gerais"
              value={edit.generalComments}
              onChange={(value) => onChange({ generalComments: value })}
              maxLength={COMMENT_LIMIT}
              error={errorFor('generalComments')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground">
              Presenças: {event.attendances.length - notRegisteredCount}/{event.attendances.length} registradas
              {notRegisteredCount > 0 && ` (${notRegisteredCount} pendentes)`}
            </span>
            <Link to={`/events/${event.id}/attendances`} className="underline-offset-4 hover:underline">
              Gerir presenças
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground">
              Ferramentas avaliadas:{' '}
              {event.toolAssessments.length === 0
                ? 'nenhuma'
                : event.toolAssessments.map((assessment) => assessment.tool?.name ?? '—').join(', ')}
            </span>
            <Link to={`/events/${event.id}`} className="underline-offset-4 hover:underline">
              Gerir avaliações de ferramenta
            </Link>
          </div>
        </div>

        <div>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onSaveOnly}>
            Salvar este evento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
