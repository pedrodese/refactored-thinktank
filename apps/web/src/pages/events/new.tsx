import { PageHeader } from '@/components/page-header'
import { EventForm } from '@/pages/events/components/event-form'

export default function EventsNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo evento"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
        ]}
      />
      <EventForm />
    </div>
  )
}
