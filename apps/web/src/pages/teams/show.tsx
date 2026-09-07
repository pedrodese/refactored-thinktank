import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { RelatedRecords } from '@/components/related-records'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError, apiFetch } from '@/lib/api-client'
import { canManageOperations } from '@/lib/authorization'
import { useAuth } from '@/lib/auth-context'
import { MEMBER_MODALITY_LABEL, MEMBER_ROLE_LABEL } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Axis } from '@/types/axis'
import type { Cluster } from '@/types/cluster'
import type { Member } from '@/types/member'
import type { PaginatedResult } from '@/types/pagination'
import type { Team } from '@/types/team'

// Sem as seções "Eventos" e "Reuniões disponíveis" que a versão Rails tinha:
// Event ainda não foi migrado (próximo grupo depois deste) — voltam quando
// existir rota pra elas.
export default function TeamsShow() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const { data: team, isLoading, error } = useApiQuery<Team>(id ? `/teams/${id}` : null)
  const { data: axis } = useApiQuery<Axis>(team?.axisId ? `/axes/${team.axisId}` : null)
  const { data: cluster } = useApiQuery<Cluster>(team?.clusterId ? `/clusters/${team.clusterId}` : null)
  const {
    data: membersResult,
    refetch: refetchMembers,
  } = useApiQuery<PaginatedResult<Member>>(id ? `/teams/${id}/members?per=100` : null)
  const members = membersResult?.data ?? []

  const canManage = canManageOperations(user?.authorizationLevel)

  const handleRemoveMember = async (member: Member) => {
    if (!id) return
    if (!window.confirm(`Remover ${member.user?.fullName ?? 'este membro'} da equipe?`)) return
    try {
      await apiFetch(`/teams/${id}/members/${member.id}`, { method: 'DELETE' })
      refetchMembers()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!team) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={team.name}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Equipes', path: '/teams' },
        ]}
        actions={
          <>
            <Button asChild>
              <Link to={`/teams/${team.id}/team-bulk-evaluations`}>Avaliações em massa</Link>
            </Button>
            {canManage && (
              <Button variant="outline" asChild>
                <Link to={`/teams/${team.id}/edit`}>Editar</Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link to="/teams">Voltar para Equipes</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="text-sm text-muted-foreground">Cluster</dt>
              <dd>
                {cluster ? (
                  <Link to={`/clusters/${cluster.id}`} className="underline-offset-4 hover:underline">
                    {cluster.name}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Eixo</dt>
              <dd>
                {axis ? (
                  <Link to={`/axes/${axis.id}`} className="underline-offset-4 hover:underline">
                    {axis.title}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Modalidade</dt>
              <dd>{team.modality}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Links</dt>
              <dd className="flex gap-3 text-sm">
                {team.linkMiro && (
                  <a href={team.linkMiro} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                    Miro
                  </a>
                )}
                {team.linkTeams && (
                  <a href={team.linkTeams} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                    Teams
                  </a>
                )}
                {!team.linkMiro && !team.linkTeams && '—'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <RelatedRecords
        title="Membros de equipe"
        count={members.length}
        emptyTitle="Nenhum membro de equipe"
        emptyMessage="Adicione membros para acompanhar papéis, modalidade e presenças."
      >
        <div className="flex flex-col gap-3">
          {canManage && (
            <div className="flex justify-end">
              <Button size="sm" asChild>
                <Link to={`/teams/${team.id}/members/new`}>Adicionar membro</Link>
              </Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Situação</TableHead>
                {canManage && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user?.fullName ?? '—'}</TableCell>
                  <TableCell>{MEMBER_ROLE_LABEL[member.role] ?? member.role}</TableCell>
                  <TableCell>{member.modality ? (MEMBER_MODALITY_LABEL[member.modality] ?? member.modality) : '—'}</TableCell>
                  <TableCell>
                    <StatusBadge tone={member.active ? 'complete' : 'neutral'}>{member.active ? 'Ativo' : 'Inativo'}</StatusBadge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/teams/${team.id}/members/${member.id}/edit`}>Editar</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRemoveMember(member)}>
                          Remover
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RelatedRecords>
    </div>
  )
}
