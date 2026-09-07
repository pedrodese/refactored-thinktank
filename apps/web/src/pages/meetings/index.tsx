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
import { useApiQuery } from '@/lib/use-api-query'
import type { Meeting } from '@/types/meeting'
import type { PaginatedResult } from '@/types/pagination'
import type { Phase } from '@/types/phase'

// A API não carrega a relação `phase` na resposta de Meeting (só `phaseId`)
// — o nome da fase é resolvido aqui a partir de `/phases`, igual o padrão já
// usado pra empresa em `users/index.tsx`.
export default function MeetingsIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const phaseId = searchParams.get('phaseId') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [qInput, setQInput] = useState(q)

  const apiQuery = new URLSearchParams({ page: String(page), per: '25' })
  if (q) apiQuery.set('q', q)
  if (phaseId) apiQuery.set('phaseId', phaseId)
  const { data: result, isLoading, error, refetch } = useApiQuery<PaginatedResult<Meeting>>(`/meetings?${apiQuery}`)

  const { data: phasesResult } = useApiQuery<PaginatedResult<Phase>>('/phases?per=100')
  const phases = phasesResult?.data ?? []
  const phaseOptions = phases.map((phase) => ({ value: phase.id, label: phase.name }))
  const phaseName = (id: string | null) => phases.find((phase) => phase.id === id)?.name

  const applyFilters = (next: { q?: string; phaseId?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['q', 'phaseId'] as const) {
      if (next[key] === undefined) continue
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const handleDelete = async (meeting: Meeting) => {
    if (!window.confirm(`Remover a reunião "${meeting.name}"?`)) return
    try {
      await apiFetch(`/meetings/${meeting.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reuniões"
        breadcrumbs={[{ label: 'Início', path: '/' }]}
        actions={
          <Button asChild>
            <Link to="/meetings/new">Nova reunião</Link>
          </Button>
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
              <Label htmlFor="meetings-q">Título</Label>
              <Input id="meetings-q" value={qInput} onChange={(event) => setQInput(event.target.value)} />
            </div>

            <SelectField
              id="meetings-phase-id"
              label="Fase"
              options={phaseOptions}
              value={phaseId}
              onChange={(value) => applyFilters({ phaseId: value, page: 1 })}
              blankLabel="Todas"
            />

            <Button type="submit">Filtrar</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQInput('')
                applyFilters({ q: '', phaseId: '', page: 1 })
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
              title="Nenhuma reunião encontrada"
              message="Ajuste os filtros ou use Nova reunião para definir mais um encaixe da metodologia."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Abreviação</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell>{meeting.abbreviation}</TableCell>
                    <TableCell>
                      <Link to={`/meetings/${meeting.id}`} className="font-medium underline-offset-4 hover:underline">
                        {meeting.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {meeting.phaseId ? (
                        <Link to={`/phases/${meeting.phaseId}`} className="underline-offset-4 hover:underline">
                          {phaseName(meeting.phaseId) ?? '—'}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/meetings/${meeting.id}/edit`}>Editar</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(meeting)}>
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
