import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EventLink } from '@/pages/dashboard/components/event-link'
import type { DashboardEventRow } from '@/types/dashboard-event-row'

interface Props {
  events: readonly DashboardEventRow[]
  withFacilitator?: boolean
  withActions?: boolean
}

export function CurrentEventsTable({ events, withFacilitator = false, withActions = false }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead>Equipe</TableHead>
          <TableHead>Cluster</TableHead>
          {withFacilitator && <TableHead>Facilitador</TableHead>}
          <TableHead>Participantes</TableHead>
          {withActions && <TableHead>Avaliação do evento</TableHead>}
          {withActions && <TableHead>Presenças</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell>
              <EventLink event={event} />
            </TableCell>
            <TableCell>{event.teamName}</TableCell>
            <TableCell>{event.clusterName}</TableCell>
            {withFacilitator && <TableCell>{event.facilitatorName}</TableCell>}
            <TableCell>
              <Link href={event.editPath} className="whitespace-nowrap underline-offset-4 hover:underline">
                {event.attendancesCount} participantes
              </Link>
            </TableCell>
            {withActions && (
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={event.editPath}>Avaliar</Link>
                </Button>
              </TableCell>
            )}
            {withActions && (
              <TableCell>
                <Button size="sm" asChild>
                  <Link href={event.editPath}>Marcar presenças</Link>
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
