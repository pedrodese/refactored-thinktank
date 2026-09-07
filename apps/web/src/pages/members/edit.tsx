import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { MembershipForm } from '@/pages/members/components/membership-form'
import type { Member } from '@/types/member'

export default function MembersEdit() {
  const { teamId, id } = useParams<{ teamId: string; id: string }>()
  const { data: member, isLoading, error } = useApiQuery<Member>(teamId && id ? `/teams/${teamId}/members/${id}` : null)
  if (!teamId) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar membro"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Equipes', path: '/teams' },
          { label: 'Equipe', path: `/teams/${teamId}` },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {member && <MembershipForm teamId={teamId} member={member} />}
    </div>
  )
}
