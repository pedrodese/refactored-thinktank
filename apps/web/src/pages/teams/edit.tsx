import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { TeamForm } from '@/pages/teams/components/team-form'
import type { Team } from '@/types/team'

export default function TeamsEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: team, isLoading, error } = useApiQuery<Team>(id ? `/teams/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar equipe"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Equipes', path: '/teams' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {team && <TeamForm team={team} />}
    </div>
  )
}
