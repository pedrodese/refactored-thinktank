import { PageHeader } from '@/components/page-header'
import { TeamForm } from '@/pages/teams/components/team-form'

export default function TeamsNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova equipe"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Equipes', path: '/teams' },
        ]}
      />
      <TeamForm />
    </div>
  )
}
