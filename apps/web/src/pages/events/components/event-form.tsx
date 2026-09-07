import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'
import { TextAreaField } from '@/components/text-area-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import { EVENT_SCORE_OPTIONS, eventScoreToFormValue } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Event } from '@/types/event'
import type { Meeting } from '@/types/meeting'
import type { PaginatedResult } from '@/types/pagination'
import type { Team } from '@/types/team'

const COMMENT_LIMIT = 280

const CRITERIA = [
  { key: 'A', label: 'Participação dos membros' },
  { key: 'B', label: 'Desenvolvimento do projeto' },
  { key: 'C', label: 'Relacionamento da equipe' },
  { key: 'D', label: 'Comprometimento com prazos' },
] as const

interface Props {
  event?: Event
}

// Sem os participantes/ferramentas avaliadas embutidos aqui (nested-attributes
// do Rails antigo) — `Attendance`/`ToolEventAssessment` são sub-recursos
// próprios (`/events/:id/attendances`, `/events/:id/tool-event-assessments`),
// geridos a partir de `events/show`, mesma decisão já tomada pra `Team.members`.
export function EventForm({ event }: Props) {
  const navigate = useNavigate()
  const { data: teamsResult } = useApiQuery<PaginatedResult<Team>>('/teams?per=100')
  const teamOptions = (teamsResult?.data ?? []).map((team) => ({ value: team.id, label: team.name }))
  const { data: meetingsResult } = useApiQuery<PaginatedResult<Meeting>>('/meetings?per=100')
  const meetingOptions = (meetingsResult?.data ?? []).map((meeting) => ({ value: meeting.id, label: meeting.name }))

  const [teamId, setTeamId] = useState(event?.teamId ?? '')
  const [meetingId, setMeetingId] = useState(event?.meetingId ?? '')
  const [date, setDate] = useState(event?.date ?? new Date().toISOString().slice(0, 10))
  const [generalComments, setGeneralComments] = useState(event?.generalComments ?? '')
  const [scores, setScores] = useState<Record<string, string>>({
    A: eventScoreToFormValue(event?.itemAScore ?? null),
    B: eventScoreToFormValue(event?.itemBScore ?? null),
    C: eventScoreToFormValue(event?.itemCScore ?? null),
    D: eventScoreToFormValue(event?.itemDScore ?? null),
  })
  const [comments, setComments] = useState<Record<string, string>>({
    A: event?.itemAComment ?? '',
    B: event?.itemBComment ?? '',
    C: event?.itemCComment ?? '',
    D: event?.itemDComment ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const assessmentPayload = () => {
    const payload: Record<string, unknown> = { generalComments }
    for (const { key } of CRITERIA) {
      if (scores[key]) payload[`item${key}Score`] = Number(scores[key])
      payload[`item${key}Comment`] = comments[key]
    }
    return payload
  }

  const save = async (goToNext: boolean) => {
    setIsSubmitting(true)
    setErrors({})
    try {
      if (event) {
        const { event: saved, nextPendingEvent } = await apiFetch<{ event: Event; nextPendingEvent: Event | null }>(
          `/events/${event.id}`,
          { method: 'PATCH', body: { teamId, meetingId, date, ...assessmentPayload(), goToNext } },
        )
        if (goToNext) {
          if (nextPendingEvent) {
            window.alert('Evento salvo. Indo para o próximo evento pendente da equipe.')
            navigate(`/events/${nextPendingEvent.id}/edit`)
          } else {
            window.alert('Evento salvo. Não há mais eventos pendentes para esta equipe.')
            navigate(`/teams/${saved.teamId}`)
          }
        } else {
          navigate(`/events/${saved.id}`)
        }
      } else {
        const created = await apiFetch<Event>('/events', { method: 'POST', body: { teamId, meetingId, date } })
        navigate(`/events/${created.id}/edit`)
      }
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors)
      else window.alert(err instanceof ApiError ? err.message : 'Não foi possível salvar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const attendancesError = errors.attendances?.join(' ')

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <form
          className="flex flex-col gap-6"
          onSubmit={(formEvent: FormEvent) => {
            formEvent.preventDefault()
            save(false)
          }}
        >
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Dados do evento</h2>
              <p className="text-sm text-muted-foreground">
                Defina equipe, reunião e data. {!event && 'As avaliações abrem depois do primeiro salvamento.'}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <SelectField
                id="event-team-id"
                label="Equipe"
                options={teamOptions}
                value={teamId}
                onChange={setTeamId}
                blankLabel="Selecione a equipe"
                error={errors.teamId?.[0]}
              />
              <SelectField
                id="event-meeting-id"
                label="Reunião"
                options={meetingOptions}
                value={meetingId}
                onChange={setMeetingId}
                blankLabel="Selecione a reunião"
                error={errors.meetingId?.[0]}
              />
              <FormField id="event-date" label="Data" type="date" value={date} onChange={setDate} error={errors.date?.[0]} />
            </div>
          </section>

          {event && (
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Avaliação do encontro</h2>
                <p className="text-sm text-muted-foreground">
                  Uma nota péssima, ruim ou não se aplica exige o comentário do critério.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {CRITERIA.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-4 rounded-md border border-border p-4">
                    <SelectField
                      id={`event-item-${key}-score`}
                      label={label}
                      options={EVENT_SCORE_OPTIONS}
                      value={scores[key] ?? ''}
                      onChange={(value) => setScores((prev) => ({ ...prev, [key]: value }))}
                      blankLabel="Sem nota"
                      error={errors[`item${key}Score`]?.[0]}
                    />
                    <TextAreaField
                      id={`event-item-${key}-comment`}
                      label="Comentário"
                      value={comments[key] ?? ''}
                      onChange={(value) => setComments((prev) => ({ ...prev, [key]: value }))}
                      maxLength={COMMENT_LIMIT}
                      error={errors[`item${key}Comment`]?.[0]}
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <TextAreaField
                    id="event-general-comments"
                    label="Comentários gerais"
                    value={generalComments}
                    onChange={setGeneralComments}
                    maxLength={COMMENT_LIMIT}
                    error={errors.generalComments?.[0]}
                  />
                </div>
              </div>
            </section>
          )}

          {attendancesError && <p className="text-sm font-medium text-destructive">{attendancesError}</p>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar evento
            </Button>
            {event && (
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => save(true)}>
                Salvar e ir para o próximo evento pendente
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => navigate(event ? `/events/${event.id}` : '/events')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
