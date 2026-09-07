import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { RelatedRecords } from '@/components/related-records'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApiQuery } from '@/lib/use-api-query'
import type { Axis } from '@/types/axis'
import type { PaginatedResult } from '@/types/pagination'

// Sem coluna de Cluster/contadores (membros ativos, eventos) — counter
// caches do Rails, não mantidos. Ver PROGRESS.md.
interface TeamSummary {
  readonly id: string
  readonly name: string
  readonly modality: string
  readonly linkMiro: string
  readonly linkTeams: string
}

export default function AxesShow() {
  const { id } = useParams<{ id: string }>()
  const { data: axis, isLoading, error } = useApiQuery<Axis>(id ? `/axes/${id}` : null)
  const { data: teamsResult } = useApiQuery<PaginatedResult<TeamSummary>>(id ? `/teams?axisId=${id}&per=100` : null)
  const teams = teamsResult?.data ?? []

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!axis) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={axis.title}
        subtitle={axis.description}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eixos', path: '/axes' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/axes/${axis.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/axes">Voltar para Eixos</Link>
            </Button>
          </>
        }
      />

      <RelatedRecords
        title="Equipes"
        count={teams.length}
        emptyTitle="Nenhuma equipe neste eixo"
        emptyMessage="As equipes aparecem aqui quando forem criadas apontando para este eixo."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
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
