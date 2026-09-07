import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { FilterSidebar } from '@/components/filter-sidebar'
import { PageHeader } from '@/components/page-header'
import { PaginationNav } from '@/components/pagination-nav'
import { SelectField } from '@/components/select-field'
import { TableCard } from '@/components/table-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError, apiFetch } from '@/lib/api-client'
import { canManageOperations } from '@/lib/authorization'
import { useAuth } from '@/lib/auth-context'
import { useApiQuery } from '@/lib/use-api-query'
import type { Axis } from '@/types/axis'
import type { Cluster } from '@/types/cluster'
import type { PaginatedResult } from '@/types/pagination'
import type { Team } from '@/types/team'

// Sem as abas de "Capítulo" (scope pronto do servidor no Rails) nem o filtro
// por dia da semana do cluster (TeamQueryDto não relaciona os dois) — e sem
// as colunas de contadores (membersCount/activeMembersCount/eventsCount, não
// mantidos). Ver PROGRESS.md.
export default function TeamsIndex() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const clusterId = searchParams.get('clusterId') ?? ''
  const axisId = searchParams.get('axisId') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [qInput, setQInput] = useState(q)

  const apiQuery = new URLSearchParams({ page: String(page), per: '25' })
  if (q) apiQuery.set('q', q)
  if (clusterId) apiQuery.set('clusterId', clusterId)
  if (axisId) apiQuery.set('axisId', axisId)
  const { data: result, isLoading, error, refetch } = useApiQuery<PaginatedResult<Team>>(`/teams?${apiQuery}`)

  const { data: clustersResult } = useApiQuery<PaginatedResult<Cluster>>('/clusters?status=all&per=100')
  const clusters = clustersResult?.data ?? []
  const clusterOptions = clusters.map((cluster) => ({ value: cluster.id, label: cluster.name }))
  const clusterName = (id: string | null) => clusters.find((cluster) => cluster.id === id)?.name

  const { data: axesResult } = useApiQuery<PaginatedResult<Axis>>('/axes?per=100')
  const axes = axesResult?.data ?? []
  const axisOptions = axes.map((axis) => ({ value: axis.id, label: axis.title }))
  const axisTitle = (id: string) => axes.find((axis) => axis.id === id)?.title

  const canManage = canManageOperations(user?.authorizationLevel)

  const applyFilters = (next: { q?: string; clusterId?: string; axisId?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['q', 'clusterId', 'axisId'] as const) {
      if (next[key] === undefined) continue
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const handleDelete = async (team: Team) => {
    if (!window.confirm(`Remover a equipe "${team.name}"?`)) return
    try {
      await apiFetch(`/teams/${team.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Equipes"
        breadcrumbs={[{ label: 'Início', path: '/' }]}
        actions={
          canManage && (
            <Button asChild>
              <Link to="/teams/new">Nova equipe</Link>
            </Button>
          )
        }
      />

      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
        <FilterSidebar>
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              applyFilters({ q: qInput, page: 1 })
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="teams-q">Nome</Label>
              <Input id="teams-q" value={qInput} onChange={(event) => setQInput(event.target.value)} />
            </div>

            <SelectField
              id="teams-cluster"
              label="Cluster"
              options={clusterOptions}
              value={clusterId}
              onChange={(value) => applyFilters({ clusterId: value, page: 1 })}
              blankLabel="Todos"
            />

            <SelectField
              id="teams-axis"
              label="Eixo"
              options={axisOptions}
              value={axisId}
              onChange={(value) => applyFilters({ axisId: value, page: 1 })}
              blankLabel="Todos"
            />

            <Button type="submit">Filtrar</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQInput('')
                applyFilters({ q: '', clusterId: '', axisId: '', page: 1 })
              }}
            >
              Limpar
            </Button>
          </form>
        </FilterSidebar>

        <TableCard
          footer={
            result && <PaginationNav pagination={result.meta} onPageChange={(nextPage) => applyFilters({ page: nextPage })} />
          }
        >
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {result && result.data.length === 0 && (
            <EmptyState
              title="Nenhuma equipe encontrada"
              message="Ajuste os filtros ou crie uma equipe para acompanhar membros, encontros e pendências."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Eixo</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Modalidade</TableHead>
                  {canManage && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <Link to={`/teams/${team.id}`} className="font-medium underline-offset-4 hover:underline">
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell>{axisTitle(team.axisId) ?? '—'}</TableCell>
                    <TableCell>{clusterName(team.clusterId) ?? '—'}</TableCell>
                    <TableCell>{team.modality}</TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/teams/${team.id}/edit`}>Editar</Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(team)}>
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableCard>
      </div>
    </div>
  )
}
