import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { ToolEventAssessmentForm } from '@/pages/tool-event-assessments/components/tool-event-assessment-form'
import type { ToolEventAssessment } from '@/types/tool-event-assessment'

export default function ToolEventAssessmentsEdit() {
  const { eventId, id } = useParams<{ eventId: string; id: string }>()
  const { data: assessment, isLoading, error } = useApiQuery<ToolEventAssessment>(
    eventId && id ? `/events/${eventId}/tool-event-assessments/${id}` : null,
  )
  if (!eventId) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar avaliação de ferramenta"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
          { label: 'Evento', path: `/events/${eventId}` },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {assessment && <ToolEventAssessmentForm eventId={eventId} assessment={assessment} />}
    </div>
  )
}
