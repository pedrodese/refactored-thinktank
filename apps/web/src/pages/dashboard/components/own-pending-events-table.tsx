import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EventLink } from '@/pages/dashboard/components/event-link'
import type { DashboardEventRow } from '@/types/dashboard-event-row'

interface Props {
  events: readonly DashboardEventRow[]
}

export function OwnPendingEventsTable({ events }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Equipe</TableHead>
          <TableHead>Cluster</TableHead>
          <TableHead>Avaliações pendentes</TableHead>
          <TableHead>Presenças pendentes</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell>
              <EventLink event={event} />
            </TableCell>
            <TableCell className="whitespace-nowrap tabular-nums">{event.date}</TableCell>
            <TableCell>{event.teamName}</TableCell>
            <TableCell>{event.clusterName}</TableCell>
            <TableCell className="tabular-nums">
              <Link
                href={event.editPath}
                aria-label={`${event.pendingAssessmentsCount} avaliações pendentes para ${event.name}`}
                className="underline-offset-4 hover:underline"
              >
                {event.pendingAssessmentsCount}
              </Link>
            </TableCell>
            <TableCell className="tabular-nums">
              <Link
                href={event.editPath}
                aria-label={`${event.pendingAttendancesCount} presenças pendentes para ${event.name}`}
                className="underline-offset-4 hover:underline"
              >
                {event.pendingAttendancesCount}
              </Link>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" asChild>
                <Link href={event.editPath}>Avaliar</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
