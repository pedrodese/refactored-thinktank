import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ATTENDANCE_STATUS_LABEL } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Attendance } from '@/types/attendance'
import type { Event } from '@/types/event'

// Sem gate de permissão: `GET /events/:eventId/attendances/:id` já exige a
// mesma checagem combinada (isElevated OU facilitator dono do cluster) que a
// escrita — ver `lib/authorization.ts`.
export default function AttendancesShow() {
  const { eventId, id } = useParams<{ eventId: string; id: string }>()
  const { data: attendance, isLoading, error } = useApiQuery<Attendance>(
    eventId && id ? `/events/${eventId}/attendances/${id}` : null,
  )
  const { data: event } = useApiQuery<Event>(eventId ? `/events/${eventId}` : null)
  if (!eventId) return null

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!attendance) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Detalhes da presença"
        subtitle={attendance.member?.fullName}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
          { label: event?.name ?? 'Evento', path: `/events/${eventId}` },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/events/${eventId}/attendances/${attendance.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to={`/events/${eventId}/attendances`}>Voltar para lista</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Membro</dt>
              <dd>{attendance.member?.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Evento</dt>
              <dd>
                {event ? (
                  <Link to={`/events/${event.id}`} className="underline-offset-4 hover:underline">
                    {event.name}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Situação</dt>
              <dd>{ATTENDANCE_STATUS_LABEL[attendance.status] ?? attendance.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Motivo</dt>
              <dd>{attendance.reason || '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
