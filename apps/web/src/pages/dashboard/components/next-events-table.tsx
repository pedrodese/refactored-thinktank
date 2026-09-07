import { Link } from '@inertiajs/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EventLink } from '@/pages/dashboard/components/event-link'
import type { DashboardEventRow } from '@/types/dashboard-event-row'

interface Props {
  events: readonly DashboardEventRow[]
  withFacilitator?: boolean
}

export function NextEventsTable({ events, withFacilitator = false }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Equipe</TableHead>
          <TableHead>Cluster</TableHead>
          {withFacilitator && <TableHead>Facilitador</TableHead>}
          <TableHead>Participantes</TableHead>
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
            {withFacilitator && <TableCell>{event.facilitatorName}</TableCell>}
            <TableCell>
              <Link href={event.path} className="whitespace-nowrap underline-offset-4 hover:underline">
                {event.attendancesCount} participantes
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
