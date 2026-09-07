import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { MeetingForm } from '@/pages/meetings/components/meeting-form'
import type { Meeting } from '@/types/meeting'

export default function MeetingsEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: meeting, isLoading, error } = useApiQuery<Meeting>(id ? `/meetings/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar reunião"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Reuniões', path: '/meetings' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {meeting && <MeetingForm meeting={meeting} />}
    </div>
  )
}
