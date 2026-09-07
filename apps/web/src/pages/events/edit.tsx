import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { EventForm } from '@/pages/events/components/event-form'
import type { Event } from '@/types/event'

export default function EventsEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading, error } = useApiQuery<Event>(id ? `/events/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar evento"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {event && <EventForm event={event} />}
    </div>
  )
}
