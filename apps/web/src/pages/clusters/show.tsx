import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { RelatedRecords } from '@/components/related-records'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { canManageOperations } from '@/lib/authorization'
import { useAuth } from '@/lib/auth-context'
import { useApiQuery } from '@/lib/use-api-query'
import type { Axis } from '@/types/axis'
import type { Chapter } from '@/types/chapter'
import type { Cluster } from '@/types/cluster'
import type { PaginatedResult } from '@/types/pagination'
import type { Team } from '@/types/team'
import type { User } from '@/types/user'

export default function ClustersShow() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const { data: cluster, isLoading, error } = useApiQuery<Cluster>(id ? `/clusters/${id}` : null)
  const { data: chapter } = useApiQuery<Chapter>(cluster?.chapterId ? `/chapters/${cluster.chapterId}` : null)
  const { data: facilitator } = useApiQuery<User>(cluster?.facilitatorId ? `/users/${cluster.facilitatorId}` : null)
  const { data: auxiliaryFacilitator } = useApiQuery<User>(
    cluster?.auxiliaryFacilitatorId ? `/users/${cluster.auxiliaryFacilitatorId}` : null,
  )
  const { data: teamsResult } = useApiQuery<PaginatedResult<Team>>(id ? `/teams?clusterId=${id}&per=100` : null)
  const { data: axesResult } = useApiQuery<PaginatedResult<Axis>>('/axes?per=100')
  const teams = teamsResult?.data ?? []
  const axisTitle = (axisId: string) => axesResult?.data.find((axis) => axis.id === axisId)?.title

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!cluster) return null

  const canManage = canManageOperations(user?.authorizationLevel)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={cluster.name}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Clusters', path: '/clusters' },
        ]}
        actions={
          <>
            {canManage && (
              <Button variant="outline" asChild>
                <Link to={`/clusters/${cluster.id}/edit`}>Editar</Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link to="/clusters">Voltar para Clusters</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <StatusBadge tone={cluster.active ? 'complete' : 'neutral'} className="self-start">
            {cluster.active ? 'Ativo' : 'Inativo'}
          </StatusBadge>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Capítulo</dt>
              <dd>
                {chapter ? (
                  <Link to={`/chapters/${chapter.id}`} className="underline-offset-4 hover:underline">
                    {chapter.title}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Dia da semana</dt>
              <dd className="capitalize">{cluster.weekDay}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Horários</dt>
              <dd>
                {cluster.startTime} – {cluster.endTime}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Datas</dt>
              <dd>{[cluster.startDate, cluster.endDate].filter(Boolean).join(' – ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Facilitador</dt>
              <dd>
                {facilitator ? (
                  <Link to={`/users/${facilitator.id}`} className="underline-offset-4 hover:underline">
                    {facilitator.fullName}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Facilitador auxiliar</dt>
              <dd>
                {auxiliaryFacilitator ? (
                  <Link to={`/users/${auxiliaryFacilitator.id}`} className="underline-offset-4 hover:underline">
                    {auxiliaryFacilitator.fullName}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Endereço</dt>
              <dd>{cluster.address ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Link</dt>
              <dd>
                {cluster.link ? (
                  <a href={cluster.link} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                    {cluster.link}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <RelatedRecords
        title="Equipes"
        count={teams.length}
        emptyTitle="Nenhuma equipe neste cluster"
        emptyMessage="As equipes aparecem aqui quando forem criadas apontando para este cluster."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Eixo</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <Link to={`/teams/${team.id}`} className="font-medium underline-offset-4 hover:underline">
                    {team.name}
                  </Link>
                </TableCell>
                <TableCell>{axisTitle(team.axisId) ?? '—'}</TableCell>
                <TableCell>{team.modality}</TableCell>
                <TableCell>
                  <div className="flex gap-3 text-sm">
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
                    {!team.linkMiro && !team.linkTeams && <span className="text-muted-foreground">—</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RelatedRecords>
    </div>
  )
}
