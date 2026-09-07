import { Link } from '@inertiajs/react'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AdminPanels } from '@/pages/dashboard/components/admin-panels'
import { ClusterFilter } from '@/pages/dashboard/components/cluster-filter'
import { FacilitatorPanels } from '@/pages/dashboard/components/facilitator-panels'
import { SecretaryPanels } from '@/pages/dashboard/components/secretary-panels'
import type { DashboardEventRow } from '@/types/dashboard-event-row'
import type { Labeled } from '@/types/labeled'

interface Props {
  variant: 'admin' | 'facilitator' | 'secretary' | 'blank'
  clusterStatus: string
  clusterStatusOptions: readonly Labeled<string>[]
  sort: { column: string; direction: string }
  exportPath: string
  teamsPath: string
  panels: {
    currentEvents: readonly DashboardEventRow[]
    nextEvents: readonly DashboardEventRow[]
    globalPendingEvents: readonly DashboardEventRow[]
    ownPendingEvents: readonly DashboardEventRow[]
  }
}

/**
 * The variant arrives decided. Which panels a person sees is an authorization
 * question, and reading the authorization level here to choose would put that
 * decision in a second place — one that a browser can be told to lie about.
 */
export default function DashboardShow({
  variant,
  clusterStatus,
  clusterStatusOptions,
  sort,
  exportPath,
  teamsPath,
  panels
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        subtitle="Acompanhe o que precisa de atenção hoje, retome pendências e avance pelas próximas ações operacionais."
      />

      {variant === 'blank' ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Bem-vindo ao Think Tank"
              message="Você ainda não tem atividades registradas. Navegue até Equipes ou Eventos para começar."
              action={
                <Button asChild>
                  <Link href={teamsPath}>Ir para Equipes</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <ClusterFilter status={clusterStatus} options={clusterStatusOptions} />
          {variant === 'admin' && (
            <AdminPanels
              currentEvents={panels.currentEvents}
              globalPendingEvents={panels.globalPendingEvents}
              ownPendingEvents={panels.ownPendingEvents}
              sort={sort}
              clusterStatus={clusterStatus}
              exportPath={exportPath}
            />
          )}
          {variant === 'facilitator' && (
            <FacilitatorPanels
              currentEvents={panels.currentEvents}
              nextEvents={panels.nextEvents}
              ownPendingEvents={panels.ownPendingEvents}
            />
          )}
          {variant === 'secretary' && (
            <SecretaryPanels
              currentEvents={panels.currentEvents}
              nextEvents={panels.nextEvents}
              globalPendingEvents={panels.globalPendingEvents}
            />
          )}
        </>
      )}
    </div>
  )
}
