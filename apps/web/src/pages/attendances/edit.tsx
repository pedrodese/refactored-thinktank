import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { AttendanceForm } from '@/pages/attendances/components/attendance-form'
import type { Attendance } from '@/types/attendance'

export default function AttendancesEdit() {
  const { eventId, id } = useParams<{ eventId: string; id: string }>()
  const { data: attendance, isLoading, error } = useApiQuery<Attendance>(
    eventId && id ? `/events/${eventId}/attendances/${id}` : null,
  )
  if (!eventId) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar presença"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
          { label: 'Presenças', path: `/events/${eventId}/attendances` },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {attendance && <AttendanceForm eventId={eventId} attendance={attendance} />}
    </div>
  )
}
