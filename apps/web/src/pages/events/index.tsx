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
import { ApiError, apiDownload, apiFetch } from '@/lib/api-client'
import { canCreateEvent, canListOperations, canManageOperations } from '@/lib/authorization'
import { useAuth } from '@/lib/auth-context'
import { useApiQuery } from '@/lib/use-api-query'
import type { Event } from '@/types/event'
import type { Meeting } from '@/types/meeting'
import type { PaginatedResult } from '@/types/pagination'
import type { Team } from '@/types/team'

const PENDING_OPTIONS = [
  { value: 'true', label: 'Pendentes' },
  { value: 'false', label: 'Sem pendências' },
]

// Sem "Situação: Concluído/Pendente" binária (o `happened` da versão Rails):
// a API só devolve `pendingAssessmentsCount` (0-4 itens sem nota) por
// evento, sem contar presenças sem registro nessa contagem — o badge mostra
// o número real em vez de arriscar um rótulo impreciso.
export default function EventsIndex() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const teamId = searchParams.get('teamId') ?? ''
  const meetingId = searchParams.get('meetingId') ?? ''
  const pending = searchParams.get('pending') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const apiQuery = new URLSearchParams({ page: String(page), per: '25' })
  if (teamId) apiQuery.set('teamId', teamId)
  if (meetingId) apiQuery.set('meetingId', meetingId)
  if (pending) apiQuery.set('pending', pending)
  const { data: result, isLoading, error, refetch } = useApiQuery<PaginatedResult<Event>>(`/events?${apiQuery}`)

  const { data: teamsResult } = useApiQuery<PaginatedResult<Team>>('/teams?per=100')
  const teams = teamsResult?.data ?? []
  const teamOptions = teams.map((team) => ({ value: team.id, label: team.name }))
  const teamName = (id: string) => teams.find((team) => team.id === id)?.name

  const { data: meetingsResult } = useApiQuery<PaginatedResult<Meeting>>('/meetings?per=100')
  const meetingOptions = (meetingsResult?.data ?? []).map((meeting) => ({ value: meeting.id, label: meeting.name }))

  // `GET /events` já vem escopado pelo backend (facilitador só lista eventos
  // de equipes que ele facilita, e nesses o `ability.rb`/`AuthorizationService`
  // dão CRUD completo — diferente de cluster/team/member, onde a propriedade
  // só afeta leitura). Por isso toda linha que aparece aqui já é gerenciável
  // por quem está vendo: um único `canManage` cobre a tabela inteira, sem
  // precisar resolver o cluster de cada equipe.
  const canManage = canListOperations(user?.authorizationLevel)

  const applyFilters = (next: { teamId?: string; meetingId?: string; pending?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['teamId', 'meetingId', 'pending'] as const) {
      if (next[key] === undefined) continue
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const handleDelete = async (event: Event) => {
    if (!window.confirm(`Remover o evento "${event.name}"?`)) return
    try {
      await apiFetch(`/events/${event.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  const handleExport = async () => {
    try {
      await apiDownload('/reports/pending-assessments.csv', 'avaliacoes-pendentes.csv')
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível exportar.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Eventos"
        subtitle="Acompanhe a agenda, encontre eventos pendentes e entre nos detalhes certos mais rápido."
        breadcrumbs={[{ label: 'Início', path: '/' }]}
        actions={
          <>
            {canManageOperations(user?.authorizationLevel) && (
              <Button variant="outline" onClick={handleExport}>
                Exportar CSV
              </Button>
            )}
            {canCreateEvent(user?.authorizationLevel) && (
              <Button asChild>
                <Link to="/events/new">Novo evento</Link>
              </Button>
            )}
          </>
        }
      />

      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
        <FilterSidebar>
          <SelectField
            id="events-pending"
            label="Situação"
            options={PENDING_OPTIONS}
            value={pending}
            onChange={(value) => applyFilters({ pending: value, page: 1 })}
            blankLabel="Todas"
          />

          <SelectField
            id="events-team"
            label="Equipe"
            options={teamOptions}
            value={teamId}
            onChange={(value) => applyFilters({ teamId: value, page: 1 })}
            blankLabel="Todas"
          />

          <SelectField
            id="events-meeting"
            label="Reunião"
            options={meetingOptions}
            value={meetingId}
            onChange={(value) => applyFilters({ meetingId: value, page: 1 })}
            blankLabel="Todas"
          />

          <Button variant="ghost" onClick={() => applyFilters({ teamId: '', meetingId: '', pending: '', page: 1 })}>
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
              title="Nenhum evento encontrado"
              message="Ajuste os filtros ou crie um evento a partir de uma reunião da equipe."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Avaliação</TableHead>
                  {canManage && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Link to={`/events/${event.id}`} className="font-medium underline-offset-4 hover:underline">
                        {event.name}
                      </Link>
                    </TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{teamName(event.teamId) ?? '—'}</TableCell>
                    <TableCell>
                      <StatusBadge tone={event.pendingAssessmentsCount > 0 ? 'pending' : 'complete'}>
                        {event.pendingAssessmentsCount > 0 ? `${event.pendingAssessmentsCount} de 4 pendentes` : 'Avaliado'}
                      </StatusBadge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/events/${event.id}/edit`}>Editar</Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(event)}>
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
