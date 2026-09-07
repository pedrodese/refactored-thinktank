import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { FilterSidebar } from '@/components/filter-sidebar'
import { PageHeader } from '@/components/page-header'
import { PaginationNav } from '@/components/pagination-nav'
import { SelectField } from '@/components/select-field'
import { StatusBadge } from '@/components/status-badge'
import { TableCard } from '@/components/table-card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError, apiFetch } from '@/lib/api-client'
import { canManageOperations } from '@/lib/authorization'
import { useAuth } from '@/lib/auth-context'
import { CLUSTER_STATUS_OPTIONS, WEEK_DAY_OPTIONS } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Chapter } from '@/types/chapter'
import type { Cluster } from '@/types/cluster'
import type { PaginatedResult } from '@/types/pagination'
import type { User } from '@/types/user'

// Sem a coluna "Equipes" (counter cache não mantido) e sem as abas de
// "Capítulo" que a versão Rails tinha (era um scope pronto do servidor) — um
// select de capítulo cobre o mesmo filtro, igual o resto do catálogo.
export default function ClustersIndex() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? 'active'
  const weekDay = searchParams.get('weekDay') ?? ''
  const chapterId = searchParams.get('chapterId') ?? ''
  const facilitatorId = searchParams.get('facilitatorId') ?? ''
  const auxiliaryFacilitatorId = searchParams.get('auxiliaryFacilitatorId') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const apiQuery = new URLSearchParams({ page: String(page), per: '25', status })
  if (weekDay) apiQuery.set('weekDay', weekDay)
  if (chapterId) apiQuery.set('chapterId', chapterId)
  if (facilitatorId) apiQuery.set('facilitatorId', facilitatorId)
  if (auxiliaryFacilitatorId) apiQuery.set('auxiliaryFacilitatorId', auxiliaryFacilitatorId)
  const { data: result, isLoading, error, refetch } = useApiQuery<PaginatedResult<Cluster>>(`/clusters?${apiQuery}`)

  const { data: chaptersResult } = useApiQuery<PaginatedResult<Chapter>>('/chapters?per=100')
  const chapters = chaptersResult?.data ?? []
  const chapterOptions = chapters.map((chapter) => ({ value: chapter.id, label: chapter.title }))
  const chapterTitle = (id: string | null) => chapters.find((chapter) => chapter.id === id)?.title

  const { data: facilitatorsResult } = useApiQuery<PaginatedResult<User>>('/users?authorizationLevel=2&per=100')
  const facilitators = facilitatorsResult?.data ?? []
  const facilitatorOptions = facilitators.map((facilitator) => ({ value: facilitator.id, label: facilitator.fullName }))
  const facilitatorName = (id: string | null) => facilitators.find((facilitator) => facilitator.id === id)?.fullName

  const canManage = canManageOperations(user?.authorizationLevel)

  const applyFilters = (
    next: Partial<Record<'status' | 'weekDay' | 'chapterId' | 'facilitatorId' | 'auxiliaryFacilitatorId', string>> & {
      page?: number
    },
  ) => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['status', 'weekDay', 'chapterId', 'facilitatorId', 'auxiliaryFacilitatorId'] as const) {
      if (next[key] === undefined) continue
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const handleDelete = async (cluster: Cluster) => {
    if (!window.confirm(`Remover o cluster de ${cluster.name}?`)) return
    try {
      await apiFetch(`/clusters/${cluster.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clusters"
        breadcrumbs={[{ label: 'Início', path: '/' }]}
        actions={
          canManage && (
            <Button asChild>
              <Link to="/clusters/new">Novo cluster</Link>
            </Button>
          )
        }
      />

      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
        <FilterSidebar>
          <SelectField
            id="clusters-status"
            label="Situação"
            options={CLUSTER_STATUS_OPTIONS}
            value={status}
            onChange={(value) => applyFilters({ status: value, page: 1 })}
          />

          <SelectField
            id="clusters-chapter"
            label="Capítulo"
            options={chapterOptions}
            value={chapterId}
            onChange={(value) => applyFilters({ chapterId: value, page: 1 })}
            blankLabel="Todos"
          />

          <SelectField
            id="clusters-week-day"
            label="Dia da semana"
            options={WEEK_DAY_OPTIONS}
            value={weekDay}
            onChange={(value) => applyFilters({ weekDay: value, page: 1 })}
            blankLabel="Todos"
          />

          <SelectField
            id="clusters-facilitator"
            label="Facilitador"
            options={facilitatorOptions}
            value={facilitatorId}
            onChange={(value) => applyFilters({ facilitatorId: value, page: 1 })}
            blankLabel="Todos"
          />

          <SelectField
            id="clusters-auxiliary-facilitator"
            label="Facilitador auxiliar"
            options={facilitatorOptions}
            value={auxiliaryFacilitatorId}
            onChange={(value) => applyFilters({ auxiliaryFacilitatorId: value, page: 1 })}
            blankLabel="Todos"
          />

          <Button
            variant="ghost"
            onClick={() => applyFilters({ status: 'active', weekDay: '', chapterId: '', facilitatorId: '', auxiliaryFacilitatorId: '', page: 1 })}
          >
            Limpar
          </Button>
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
              title="Nenhum cluster encontrado"
              message="Ajuste os filtros ou abra um cluster novo para agrupar as equipes que se encontram juntas."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia da semana</TableHead>
                  <TableHead>Capítulo</TableHead>
                  <TableHead>Horários</TableHead>
                  <TableHead>Facilitadores</TableHead>
                  <TableHead>Situação</TableHead>
                  {canManage && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((cluster) => (
                  <TableRow key={cluster.id}>
                    <TableCell>
                      <Link to={`/clusters/${cluster.id}`} className="font-medium underline-offset-4 hover:underline">
                        {cluster.name}
                      </Link>
                    </TableCell>
                    <TableCell>{chapterTitle(cluster.chapterId) ?? '—'}</TableCell>
                    <TableCell>
                      {cluster.startTime} – {cluster.endTime}
                    </TableCell>
                    <TableCell>
                      {[facilitatorName(cluster.facilitatorId), facilitatorName(cluster.auxiliaryFacilitatorId)]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={cluster.active ? 'complete' : 'neutral'}>{cluster.active ? 'Ativo' : 'Inativo'}</StatusBadge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/clusters/${cluster.id}/edit`}>Editar</Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(cluster)}>
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
