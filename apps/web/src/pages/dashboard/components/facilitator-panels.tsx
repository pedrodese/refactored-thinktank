import { CurrentEventsTable } from '@/pages/dashboard/components/current-events-table'
import { DashboardPanel } from '@/pages/dashboard/components/dashboard-panel'
import { NextEventsTable } from '@/pages/dashboard/components/next-events-table'
import { OwnPendingEventsTable } from '@/pages/dashboard/components/own-pending-events-table'
import type { DashboardEventRow } from '@/types/dashboard-event-row'

interface Props {
  currentEvents: readonly DashboardEventRow[]
  nextEvents: readonly DashboardEventRow[]
  ownPendingEvents: readonly DashboardEventRow[]
}

export function FacilitatorPanels({ currentEvents, nextEvents, ownPendingEvents }: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="flex flex-col gap-6">
        {currentEvents.length > 0 && (
          <DashboardPanel title="Eventos de hoje" count={currentEvents.length} emptyMessage="Nenhum evento hoje.">
            <CurrentEventsTable events={currentEvents} withActions />
          </DashboardPanel>
        )}

        <DashboardPanel
          title="Próximos eventos"
          count={nextEvents.length}
          emptyMessage="Nenhum evento agendado."
        >
          <NextEventsTable events={nextEvents} />
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
