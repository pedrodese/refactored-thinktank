import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { AttendanceForm } from '@/pages/attendances/components/attendance-form'

export default function AttendancesNew() {
  const { eventId } = useParams<{ eventId: string }>()
  if (!eventId) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova presença"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
          { label: 'Presenças', path: `/events/${eventId}/attendances` },
        ]}
      />
      <AttendanceForm eventId={eventId} />
    </div>
  )
}
