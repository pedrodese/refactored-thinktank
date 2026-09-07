import { Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CurrentEventsTable } from '@/pages/dashboard/components/current-events-table'
import { DashboardPanel } from '@/pages/dashboard/components/dashboard-panel'
import { EventLink } from '@/pages/dashboard/components/event-link'
import { OwnPendingEventsTable } from '@/pages/dashboard/components/own-pending-events-table'
import type { DashboardEventRow } from '@/types/dashboard-event-row'

interface Props {
  currentEvents: readonly DashboardEventRow[]
  globalPendingEvents: readonly DashboardEventRow[]
  ownPendingEvents: readonly DashboardEventRow[]
  sort: { column: string; direction: string }
  clusterStatus: string
  exportPath: string
}

export function AdminPanels({
  currentEvents,
  globalPendingEvents,
  ownPendingEvents,
  sort,
  clusterStatus,
  exportPath
}: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="flex flex-col gap-6">
        {currentEvents.length > 0 && (
          <DashboardPanel title="Eventos de hoje" count={currentEvents.length} emptyMessage="Nenhum evento hoje.">
            <CurrentEventsTable events={currentEvents} withActions />
          </DashboardPanel>
        )}

        <DashboardPanel
          title="Avaliações pendentes de todas as equipes"
          count={globalPendingEvents.length}
          emptyMessage="Nenhuma avaliação pendente."
          action={
            <Button variant="outline" size="sm" asChild>
              {/* A plain anchor: the response is a CSV, which Inertia's client
                  cannot swap into the page it is holding. */}
              <a href={exportPath}>Exportar CSV</a>
            </Button>
          }
        >
          <GlobalPendingTable events={globalPendingEvents} sort={sort} clusterStatus={clusterStatus} />
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Avaliações pendentes em eventos das suas equipes"
        count={ownPendingEvents.length}
        emptyMessage="Nenhuma avaliação pendente."
      >
        <OwnPendingEventsTable events={ownPendingEvents} />
      </DashboardPanel>
    </div>
  )
}

interface GlobalPendingTableProps {
  events: readonly DashboardEventRow[]
  sort: { column: string; direction: string }
  clusterStatus: string
}

// The sort is the server's: the header sends the column and the direction back
// as query parameters and the ordering is decided there, as it was in the ERB.
function GlobalPendingTable({ events, sort, clusterStatus }: GlobalPendingTableProps) {
  const sortBy = (column: string) =>
    router.get(
      '/',
      { cluster_status: clusterStatus, sort: column, order: nextDirection(sort, column) },
      { preserveState: true }
    )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead>
            <SortButton label="Data" column="events.date" sort={sort} onSort={sortBy} />
          </TableHead>
          <TableHead>
            <SortButton label="Equipe" column="team.name" sort={sort} onSort={sortBy} />
          </TableHead>
          <TableHead>Facilitador</TableHead>
          <TableHead>Avaliações pendentes</TableHead>
          <TableHead>Presenças pendentes</TableHead>
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
            <TableCell>{event.facilitatorName}</TableCell>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface SortButtonProps {
  label: string
  column: string
  sort: { column: string; direction: string }
  onSort: (column: string) => void
}

function SortButton({ label, column, sort, onSort }: SortButtonProps) {
  const isSorted = sort.column === column

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
      className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {label} {isSorted && (sort.direction === 'asc' ? '▲' : '▼')}
    </button>
  )
}

function nextDirection(sort: { column: string; direction: string }, column: string) {
  return sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc'
}
