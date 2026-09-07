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
import { AUTHORIZATION_LEVEL_LABEL, AUTHORIZATION_LEVEL_OPTIONS } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Company } from '@/types/company'
import type { PaginatedResult } from '@/types/pagination'
import type { User } from '@/types/user'

// Filtros reduzidos ao que `QueryUserDto` de fato aceita (q/authorizationLevel/
// companyId) — a versão Rails tinha scope/nickname/address/cpf/rg/teamId e
// exportação CSV, mas nada disso existe na API nova ainda. Repor se/quando a
// API ganhar esses filtros.
export default function UsersIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const authorizationLevel = searchParams.get('authorizationLevel') ?? ''
  const companyId = searchParams.get('companyId') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [qInput, setQInput] = useState(q)

  const apiQuery = new URLSearchParams({ page: String(page), per: '25' })
  if (q) apiQuery.set('q', q)
  if (authorizationLevel) apiQuery.set('authorizationLevel', authorizationLevel)
  if (companyId) apiQuery.set('companyId', companyId)
  const { data: result, isLoading, error, refetch } = useApiQuery<PaginatedResult<User>>(`/users?${apiQuery}`)

  const { data: companiesResult } = useApiQuery<PaginatedResult<Company>>('/companies?per=100')
  const companies = companiesResult?.data ?? []
  const companyOptions = companies.map((company) => ({ value: company.id, label: company.name }))
  const companyName = (id: string | null) => companies.find((company) => company.id === id)?.name

  const applyFilters = (next: { q?: string; authorizationLevel?: string; companyId?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['q', 'authorizationLevel', 'companyId'] as const) {
      if (next[key] === undefined) continue
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    params.set('page', String(next.page ?? 1))
    setSearchParams(params)
  }

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Remover ${user.fullName}?`)) return
    try {
      await apiFetch(`/users/${user.id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Não foi possível remover.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pessoas"
        breadcrumbs={[{ label: 'Início', path: '/' }]}
        actions={
          <Button asChild>
            <Link to="/users/new">Nova pessoa</Link>
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
              <Label htmlFor="users-q">Nome</Label>
              <Input id="users-q" value={qInput} onChange={(event) => setQInput(event.target.value)} />
            </div>

            <SelectField
              id="users-authorization-level"
              label="Autorização"
              options={AUTHORIZATION_LEVEL_OPTIONS}
              value={authorizationLevel}
              onChange={(value) => applyFilters({ authorizationLevel: value, page: 1 })}
              blankLabel="Todas"
            />

            <SelectField
              id="users-company"
              label="Empresa"
              options={companyOptions}
              value={companyId}
              onChange={(value) => applyFilters({ companyId: value, page: 1 })}
              blankLabel="Todas"
            />

            <Button type="submit">Filtrar</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQInput('')
                applyFilters({ q: '', authorizationLevel: '', companyId: '', page: 1 })
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
              title="Nenhuma pessoa encontrada"
              message="Ajuste os filtros ou use Nova pessoa para cadastrar alguém."
            />
          )}
          {result && result.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Autorização</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link to={`/users/${user.id}`} className="font-medium underline-offset-4 hover:underline">
                        {user.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email || '—'}</TableCell>
                    <TableCell>{AUTHORIZATION_LEVEL_LABEL[user.authorizationLevel] ?? user.authorizationLevel}</TableCell>
                    <TableCell>
                      {user.companyId ? (
                        <Link to={`/companies/${user.companyId}`} className="underline-offset-4 hover:underline">
                          {companyName(user.companyId) ?? '—'}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/users/${user.id}/edit`}>Editar</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(user)}>
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
