import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { RelatedRecords } from '@/components/related-records'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError, apiFetch } from '@/lib/api-client'
import { EVENT_SCORE_LABEL } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Event } from '@/types/event'
import type { Meeting } from '@/types/meeting'
import type { PaginatedResult } from '@/types/pagination'
import type { Team } from '@/types/team'
import type { ToolEventAssessment } from '@/types/tool-event-assessment'

const CRITERIA = [
  { key: 'A', label: 'Participação dos membros' },
  { key: 'B', label: 'Desenvolvimento do projeto' },
  { key: 'C', label: 'Relacionamento da equipe' },
  { key: 'D', label: 'Comprometimento com prazos' },
] as const

// Sem gate de permissão pra Editar/Presenças/gerir avaliações de ferramenta:
// `GET /events/:id`/`/tool-event-assessments` já usa a mesma checagem
// combinada (isElevated OU facilitator dono do cluster da equipe) que a
// escrita — se a página carregou, quem está vendo já pode gerenciar tudo
// aqui. Ver `lib/authorization.ts`.
export default function EventsShow() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading, error } = useApiQuery<Event>(id ? `/events/${id}` : null)
  const { data: team } = useApiQuery<Team>(event?.teamId ? `/teams/${event.teamId}` : null)
  const { data: meeting } = useApiQuery<Meeting>(event?.meetingId ? `/meetings/${event.meetingId}` : null)
  const {
    data: assessmentsResult,
    refetch: refetchAssessments,
  } = useApiQuery<PaginatedResult<ToolEventAssessment>>(id ? `/events/${id}/tool-event-assessments?per=100` : null)
  const toolAssessments = assessmentsResult?.data ?? []

  const handleRemoveAssessment = async (assessment: ToolEventAssessment) => {
    if (!id) return
    if (!window.confirm(`Remover a avaliação de "${assessment.tool?.name ?? 'ferramenta'}"?`)) return
    try {
      await apiFetch(`/events/${id}/tool-event-assessments/${assessment.id}`, { method: 'DELETE' })
      refetchAssessments()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!event) return null

  const scoredCriteria = CRITERIA.map(({ key, label }) => ({
    key,
    label,
    score: event[`item${key}Score` as 'itemAScore'],
    comment: event[`item${key}Comment` as 'itemAComment'],
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={event.name}
        subtitle={`${team?.name ?? '—'} — ${event.date}`}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/events/${event.id}/attendances`}>Presenças</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/events/${event.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/events">Voltar para Eventos</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone={event.pendingAssessmentsCount > 0 ? 'pending' : 'complete'}>
              {event.pendingAssessmentsCount > 0 ? `${event.pendingAssessmentsCount} de 4 pendentes` : 'Avaliado'}
            </StatusBadge>
            {typeof event.pendingAttendancesCount === 'number' && event.pendingAttendancesCount > 0 && (
              <StatusBadge tone="pending">{event.pendingAttendancesCount} presenças sem registro</StatusBadge>
            )}
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Equipe</dt>
              <dd>
                {team ? (
                  <Link to={`/teams/${team.id}`} className="underline-offset-4 hover:underline">
                    {team.name}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Reunião</dt>
              <dd>{meeting?.name ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <RelatedRecords
        title="Avaliação do encontro"
        count={scoredCriteria.filter((criterion) => criterion.score).length}
        emptyTitle="Nenhum critério avaliado"
        emptyMessage="Abra a edição do evento para registrar as notas dos quatro critérios."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Critério</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Comentário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scoredCriteria.map((criterion) => (
              <TableRow key={criterion.key}>
                <TableCell className="font-medium">{criterion.label}</TableCell>
                <TableCell>{criterion.score ? (EVENT_SCORE_LABEL[criterion.score] ?? criterion.score) : '—'}</TableCell>
                <TableCell>{criterion.comment || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RelatedRecords>

      {event.generalComments && (
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Comentários gerais</p>
            <p>{event.generalComments}</p>
          </CardContent>
        </Card>
      )}

      <RelatedRecords
        title="Ferramentas avaliadas"
        count={toolAssessments.length}
        emptyTitle="Nenhuma ferramenta avaliada"
        emptyMessage="Adicione apenas as ferramentas usadas neste encontro."
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Button size="sm" asChild>
              <Link to={`/events/${event.id}/tool-event-assessments/new`}>Adicionar avaliação</Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ferramenta</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Comentário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toolAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.tool?.name ?? '—'}</TableCell>
                  <TableCell>{EVENT_SCORE_LABEL[assessment.score] ?? assessment.score}</TableCell>
                  <TableCell>{assessment.comment || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/events/${event.id}/tool-event-assessments/${assessment.id}/edit`}>Editar</Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRemoveAssessment(assessment)}>
                        Remover
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RelatedRecords>
    </div>
  )
}
