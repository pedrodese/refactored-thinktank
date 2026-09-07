import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import { useApiQuery } from '@/lib/use-api-query'
import {
  EventAssessmentCard,
  buildEditState,
  buildPayload,
  type BulkEvent,
  type EditState,
} from '@/pages/team_bulk_evaluations/components/event-assessment-card'

interface BulkEvaluationsResponse {
  readonly team: { readonly id: string; readonly name: string }
  readonly events: readonly BulkEvent[]
}

interface RejectedItem {
  readonly id: string
  readonly errors: unknown
}

export default function TeamBulkEvaluationsShow() {
  const { teamId } = useParams<{ teamId: string }>()
  const { data: result, isLoading, error } = useApiQuery<BulkEvaluationsResponse>(
    teamId ? `/teams/${teamId}/team-bulk-evaluations` : null,
  )

  if (!teamId) return null
  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!result) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Avaliações em massa: ${result.team.name}`}
        subtitle="Complete avaliações pendentes dos eventos da equipe em um fluxo contínuo."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Equipes', path: '/teams' },
          { label: result.team.name, path: `/teams/${result.team.id}` },
        ]}
        actions={
          <Button variant="ghost" asChild>
            <Link to={`/teams/${result.team.id}`}>Voltar para a equipe</Link>
          </Button>
        }
      />

      {result.events.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState title="Nenhuma avaliação pendente" message="A equipe já está em dia com as avaliações pendentes." />
          </CardContent>
        </Card>
      ) : (
        <BulkEvaluationsForm teamId={teamId} events={result.events} />
      )}
    </div>
  )
}

// Componente próprio pra poder guardar os edits em `useState` inicializado a
// partir do fetch — só monta quando `events` já chegou, então o inicializador
// lazy do useState vê o valor de verdade uma única vez. Sem refetch depois de
// salvar: isso preservaria os edits ainda não salvos dos outros cards, ao
// custo de a lista de pendências só atualizar de fato num reload da página.
function BulkEvaluationsForm({ teamId, events }: { teamId: string; events: readonly BulkEvent[] }) {
  const [edits, setEdits] = useState<Record<string, EditState>>(() =>
    Object.fromEntries(events.map((event) => [event.id, buildEditState(event)])),
  )
  const [errorsByEvent, setErrorsByEvent] = useState<Record<string, Record<string, string[]>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // `edits` é inicializado com exatamente os ids de `events` no mount (ver
  // useState acima) e nunca perde uma chave depois — daí a asserção: o id
  // sempre existe em runtime, `noUncheckedIndexedAccess` só não sabe disso.
  const updateEdit = (id: string, changes: Partial<EditState>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id]!, ...changes } }))

  const saveEvents = async (ids: readonly string[]) => {
    setIsSubmitting(true)
    try {
      const response = await apiFetch<{ updated: unknown[]; rejected: RejectedItem[] }>(
        `/teams/${teamId}/team-bulk-evaluations`,
        { method: 'PATCH', body: { events: ids.map((id) => ({ id, ...buildPayload(edits[id]!) })) } },
      )

      const nextErrors = { ...errorsByEvent }
      for (const id of ids) delete nextErrors[id]
      for (const rejected of response.rejected) {
        const rejectedErrors = rejected.errors
        nextErrors[rejected.id] = Array.isArray(rejectedErrors)
          ? { generalComments: rejectedErrors as string[] }
          : ((rejectedErrors as Record<string, string[]>) ?? {})
      }
      setErrorsByEvent(nextErrors)

      if (response.rejected.length > 0) {
        window.alert(
          `${response.updated.length} evento(s) salvo(s), ${response.rejected.length} com erro — ver os campos marcados.`,
        )
      }
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível salvar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {events.map((event) => (
        <EventAssessmentCard
          key={event.id}
          event={event}
          edit={edits[event.id]!}
          onChange={(changes) => updateEdit(event.id, changes)}
          errors={errorsByEvent[event.id]}
          isSubmitting={isSubmitting}
          onSaveOnly={() => saveEvents([event.id])}
        />
      ))}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} onClick={() => saveEvents(events.map((event) => event.id))}>
          Salvar todas as avaliações
        </Button>
      </div>
    </div>
  )
}
