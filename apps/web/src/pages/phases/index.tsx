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
import type { PaginatedResult } from '@/types/pagination'
import type { Phase } from '@/types/phase'
import type { MethodologyTool } from '@/types/methodology-tool'

// A contagem de "Ferramentas" vem de graça (`toolIds.length`, embutido na
// resposta da API) — mas "Reuniões" foi removida: a API não relaciona Meeting
// a Phase por contador, só por `phaseId`, e listar isso por linha exigiria uma
// chamada por fase (N+1). Ver a contagem de verdade no detalhe da fase.
export default function PhasesIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const toolId = searchParams.get('toolId') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [qInput, setQInput] = useState(q)

  const apiQuery = new URLSearchParams({ page: String(page), per: '25' })
  if (q) apiQuery.set('q', q)
  if (toolId) apiQuery.set('toolId', toolId)
  const { data: result, isLoading, error, refetch } = useApiQuery<PaginatedResult<Phase>>(`/phases?${apiQuery}`)

  const { data: toolsResult } = useApiQuery<PaginatedResult<MethodologyTool>>('/tools?per=100')
  const toolOptions = (toolsResult?.data ?? []).map((tool) => ({ value: tool.id, label: tool.name }))

  const applyFilters = (next: { q?: string; toolId?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['q', 'toolId'] as const) {
      if (next[key] === undefined) continue
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const handleDelete = async (phase: Phase) => {
    if (!window.confirm(`Remover a fase "${phase.name}"?`)) return
    try {
      await apiFetch(`/phases/${phase.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fases"
        breadcrumbs={[{ label: 'Início', path: '/' }]}
        actions={
          <Button asChild>
            <Link to="/phases/new">Nova fase</Link>
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
              <Label htmlFor="phases-q">Nome</Label>
              <Input id="phases-q" value={qInput} onChange={(event) => setQInput(event.target.value)} />
            </div>

            <SelectField
              id="phases-tool-id"
              label="Ferramenta"
              options={toolOptions}
              value={toolId}
              onChange={(value) => applyFilters({ toolId: value, page: 1 })}
              blankLabel="Todas"
            />

            <Button type="submit">Filtrar</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQInput('')
                applyFilters({ q: '', toolId: '', page: 1 })
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
              title="Nenhuma fase encontrada"
              message="Ajuste os filtros ou use Nova fase para desenhar mais uma etapa da metodologia."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ferramentas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((phase) => (
                  <TableRow key={phase.id}>
                    <TableCell>
                      <Link to={`/phases/${phase.id}`} className="font-medium underline-offset-4 hover:underline">
                        {phase.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{phase.toolIds.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/phases/${phase.id}/edit`}>Editar</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(phase)}>
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
