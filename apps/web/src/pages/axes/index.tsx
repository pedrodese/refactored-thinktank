import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { FilterSidebar } from '@/components/filter-sidebar'
import { PageHeader } from '@/components/page-header'
import { PaginationNav } from '@/components/pagination-nav'
import { TableCard } from '@/components/table-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError, apiFetch } from '@/lib/api-client'
import { useApiQuery } from '@/lib/use-api-query'
import type { Axis } from '@/types/axis'
import type { PaginatedResult } from '@/types/pagination'

// Sem a coluna "Equipes" que a versão Rails tinha (teamsCount, counter cache
// não mantido) e sem o filtro por escopo de capítulo (a API não relaciona
// Axis a Chapter) — ver PROGRESS.md.
export default function AxesIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [qInput, setQInput] = useState(q)

  const apiQuery = new URLSearchParams({ page: String(page), per: '25' })
  if (q) apiQuery.set('q', q)
  const { data: result, isLoading, error, refetch } = useApiQuery<PaginatedResult<Axis>>(`/axes?${apiQuery}`)

  const applyFilters = (next: { q?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q)
      else params.delete('q')
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const handleDelete = async (axis: Axis) => {
    if (!window.confirm(`Remover o eixo "${axis.title}"?`)) return
    try {
      await apiFetch(`/axes/${axis.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Eixos"
        breadcrumbs={[{ label: 'Início', path: '/' }]}
        actions={
          <Button asChild>
            <Link to="/axes/new">Novo eixo</Link>
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
              <Label htmlFor="axes-q">Título</Label>
              <Input id="axes-q" value={qInput} onChange={(event) => setQInput(event.target.value)} />
            </div>
            <Button type="submit">Filtrar</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQInput('')
                applyFilters({ q: '', page: 1 })
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
              title="Nenhum eixo encontrado"
              message="Ajuste os filtros ou use Novo eixo para começar a organizar as equipes por tema."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((axis) => (
                  <TableRow key={axis.id}>
                    <TableCell>
                      <Link to={`/axes/${axis.id}`} className="font-medium underline-offset-4 hover:underline">
                        {axis.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{axis.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/axes/${axis.id}/edit`}>Editar</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(axis)}>
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
