import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CurrentEventsTable } from '@/pages/dashboard/components/current-events-table'
import { DashboardPanel } from '@/pages/dashboard/components/dashboard-panel'
import { EventLink } from '@/pages/dashboard/components/event-link'
import { NextEventsTable } from '@/pages/dashboard/components/next-events-table'
import type { DashboardEventRow } from '@/types/dashboard-event-row'

interface Props {
  currentEvents: readonly DashboardEventRow[]
  nextEvents: readonly DashboardEventRow[]
  globalPendingEvents: readonly DashboardEventRow[]
}

export function SecretaryPanels({ currentEvents, nextEvents, globalPendingEvents }: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="flex flex-col gap-6">
        {currentEvents.length > 0 && (
          <DashboardPanel title="Eventos de hoje" count={currentEvents.length} emptyMessage="Nenhum evento hoje.">
            <CurrentEventsTable events={currentEvents} withFacilitator />
          </DashboardPanel>
        )}

        <DashboardPanel title="Próximos eventos" count={nextEvents.length} emptyMessage="Nenhum evento agendado.">
          <NextEventsTable events={nextEvents} withFacilitator />
        </DashboardPanel>
      </div>

      <div className="xl:col-span-2">
        <DashboardPanel
          title="Eventos com avaliações pendentes"
          count={globalPendingEvents.length}
          emptyMessage="Nenhuma avaliação pendente."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Facilitador</TableHead>
                <TableHead>Presentes</TableHead>
                <TableHead>Ausentes</TableHead>
                <TableHead>Em branco</TableHead>
                <TableHead>Avaliar</TableHead>
                <TableHead>Presenças</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {globalPendingEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <EventLink event={event} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{event.date}</TableCell>
                  <TableCell>{event.teamName}</TableCell>
                  <TableCell>{event.clusterName}</TableCell>
                  <TableCell>
                    {event.facilitatorPath ? (
                      <Link href={event.facilitatorPath} className="underline-offset-4 hover:underline">
                        {event.facilitatorName}
                      </Link>
                    ) : (
                      event.facilitatorName
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums">{event.presentCount}</TableCell>
                  <TableCell className="tabular-nums">{event.absentCount}</TableCell>
                  <TableCell className="tabular-nums">{event.pendingAttendancesCount}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={event.path}>Avaliar</Link>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" asChild>
                      <Link href={event.path}>Presenças</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardPanel>
      </div>
    </div>
  )
}
