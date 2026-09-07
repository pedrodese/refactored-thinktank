import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { ToolEventAssessmentForm } from '@/pages/tool-event-assessments/components/tool-event-assessment-form'

export default function ToolEventAssessmentsNew() {
  const { eventId } = useParams<{ eventId: string }>()
  if (!eventId) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova avaliação de ferramenta"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
          { label: 'Evento', path: `/events/${eventId}` },
        ]}
      />
      <ToolEventAssessmentForm eventId={eventId} />
    </div>
  )
}
