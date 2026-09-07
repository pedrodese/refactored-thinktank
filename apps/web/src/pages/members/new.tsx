import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { MembershipForm } from '@/pages/members/components/membership-form'

export default function MembersNew() {
  const { teamId } = useParams<{ teamId: string }>()
  if (!teamId) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo membro"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Equipes', path: '/teams' },
          { label: 'Equipe', path: `/teams/${teamId}` },
        ]}
      />
      <MembershipForm teamId={teamId} />
    </div>
  )
}
