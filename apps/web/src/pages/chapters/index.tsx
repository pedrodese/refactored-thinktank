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
import { EDITION_YEAR_OPTIONS } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Chapter } from '@/types/chapter'
import type { PaginatedResult } from '@/types/pagination'

// Sem a coluna "Clusters" que a versão Rails tinha (clustersCount, counter
// cache não mantido nesta migração) — ver PROGRESS.md.
export default function ChaptersIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const editionYear = searchParams.get('editionYear') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [qInput, setQInput] = useState(q)

  const apiQuery = new URLSearchParams({ page: String(page), per: '25' })
  if (q) apiQuery.set('q', q)
  if (editionYear) apiQuery.set('editionYear', editionYear)
  const { data: result, isLoading, error, refetch } = useApiQuery<PaginatedResult<Chapter>>(`/chapters?${apiQuery}`)

  const applyFilters = (next: { q?: string; editionYear?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['q', 'editionYear'] as const) {
      if (next[key] === undefined) continue
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const handleDelete = async (chapter: Chapter) => {
    if (!window.confirm(`Remover o capítulo "${chapter.title}"?`)) return
    try {
      await apiFetch(`/chapters/${chapter.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Capítulos"
        breadcrumbs={[{ label: 'Início', path: '/' }]}
        actions={
          <Button asChild>
            <Link to="/chapters/new">Novo capítulo</Link>
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
              <Label htmlFor="chapters-q">Título</Label>
              <Input id="chapters-q" value={qInput} onChange={(event) => setQInput(event.target.value)} />
            </div>

            <SelectField
              id="chapters-edition-year"
              label="Ano da edição"
              options={EDITION_YEAR_OPTIONS}
              value={editionYear}
              onChange={(value) => applyFilters({ editionYear: value, page: 1 })}
              blankLabel="Todos"
            />

            <Button type="submit">Filtrar</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQInput('')
                applyFilters({ q: '', editionYear: '', page: 1 })
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
              title="Nenhum capítulo encontrado"
              message="Ajuste os filtros ou use Novo capítulo para abrir uma edição do programa."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Ano da edição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((chapter) => (
                  <TableRow key={chapter.id}>
                    <TableCell>
                      <Link to={`/chapters/${chapter.id}`} className="font-medium underline-offset-4 hover:underline">
                        {chapter.title}
                      </Link>
                    </TableCell>
                    <TableCell>{chapter.editionYear}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/chapters/${chapter.id}/edit`}>Editar</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(chapter)}>
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
