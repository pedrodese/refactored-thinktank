import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { FilterSidebar } from '@/components/filter-sidebar'
import { PageHeader } from '@/components/page-header'
import { PaginationNav } from '@/components/pagination-nav'
import { SelectField } from '@/components/select-field'
import { TableCard } from '@/components/table-card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError, apiFetch } from '@/lib/api-client'
import { ATTENDANCE_STATUS_LABEL, ATTENDANCE_STATUS_OPTIONS } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Attendance } from '@/types/attendance'
import type { Event } from '@/types/event'
import type { Member } from '@/types/member'
import type { PaginatedResult } from '@/types/pagination'

// Sem gate de permissão: `GET /events/:eventId/attendances` já exige a mesma
// checagem combinada (isElevated OU facilitator dono do cluster) que a
// escrita — ver `lib/authorization.ts`.
export default function AttendancesIndex() {
  const { eventId } = useParams<{ eventId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const memberId = searchParams.get('memberId') ?? ''
  const status = searchParams.get('status') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const { data: event } = useApiQuery<Event>(eventId ? `/events/${eventId}` : null)
  const { data: membersResult } = useApiQuery<PaginatedResult<Member>>(event?.teamId ? `/teams/${event.teamId}/members?per=100` : null)
  const memberOptions = (membersResult?.data ?? []).map((member) => ({ value: member.id, label: member.user?.fullName ?? member.id }))

  const apiQuery = new URLSearchParams({ page: String(page), per: '25' })
  if (memberId) apiQuery.set('memberId', memberId)
  if (status) apiQuery.set('status', status)
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useApiQuery<PaginatedResult<Attendance>>(eventId ? `/events/${eventId}/attendances?${apiQuery}` : null)

  const applyFilters = (next: { memberId?: string; status?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['memberId', 'status'] as const) {
      if (next[key] === undefined) continue
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const setStatus = async (attendance: Attendance, statusValue: number) => {
    if (!eventId) return
    try {
      await apiFetch(`/events/${eventId}/attendances/${attendance.id}/status`, { method: 'PATCH', body: { status: statusValue } })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível salvar.')
    }
  }

  const handleDelete = async (attendance: Attendance) => {
    if (!eventId) return
    if (!window.confirm(`Remover a presença de ${attendance.member?.fullName ?? 'este membro'}?`)) return
    try {
      await apiFetch(`/events/${eventId}/attendances/${attendance.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  if (!eventId) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Presenças"
        subtitle={event ? `${event.name} — ${event.date}` : undefined}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eventos', path: '/events' },
          { label: event?.name ?? 'Evento', path: `/events/${eventId}` },
        ]}
        actions={
          <Button asChild>
            <Link to={`/events/${eventId}/attendances/new`}>Nova presença</Link>
          </Button>
        }
      />

      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
        <FilterSidebar>
          <SelectField
            id="attendances-member"
            label="Membro"
            options={memberOptions}
            value={memberId}
            onChange={(value) => applyFilters({ memberId: value, page: 1 })}
            blankLabel="Todos"
          />
          <SelectField
            id="attendances-status"
            label="Situação"
            options={ATTENDANCE_STATUS_OPTIONS}
            value={status}
            onChange={(value) => applyFilters({ status: value, page: 1 })}
            blankLabel="Todas"
          />
          <Button variant="ghost" onClick={() => applyFilters({ memberId: '', status: '', page: 1 })}>
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
              title="Nenhuma presença encontrada"
              message="Adicione presenças a partir dos membros ativos da equipe."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell>
                      <Link
                        to={`/events/${eventId}/attendances/${attendance.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {attendance.member?.fullName ?? '—'}
                      </Link>
                    </TableCell>
                    <TableCell>{ATTENDANCE_STATUS_LABEL[attendance.status] ?? attendance.status}</TableCell>
                    <TableCell>{attendance.reason || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setStatus(attendance, 1)}>
                          Presente
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setStatus(attendance, 2)}>
                          Ausente
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/events/${eventId}/attendances/${attendance.id}/edit`}>Editar</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(attendance)}>
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
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
