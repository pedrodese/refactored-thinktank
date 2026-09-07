import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { RelatedRecords } from '@/components/related-records'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApiQuery } from '@/lib/use-api-query'
import type { Company } from '@/types/company'
import type { PaginatedResult } from '@/types/pagination'
import type { User } from '@/types/user'

export default function CompaniesShow() {
  const { id } = useParams<{ id: string }>()
  const { data: company, isLoading, error } = useApiQuery<Company>(id ? `/companies/${id}` : null)
  const { data: usersResult } = useApiQuery<PaginatedResult<User>>(id ? `/users?companyId=${id}&per=100` : null)
  const users = usersResult?.data ?? []

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!company) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={company.name}
        subtitle={company.cnpj}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Empresas', path: '/companies' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/companies/${company.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/companies">Voltar para Empresas</Link>
            </Button>
          </>
        }
      />

      <RelatedRecords
        title="Pessoas associadas"
        count={users.length}
        emptyTitle="Nenhuma pessoa associada"
        emptyMessage="As pessoas aparecem aqui quando a empresa for definida no cadastro delas."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((person) => (
              <TableRow key={person.id}>
                <TableCell>
                  <Link to={`/users/${person.id}`} className="font-medium underline-offset-4 hover:underline">
                    {person.fullName}
                  </Link>
                </TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.phoneNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RelatedRecords>
    </div>
  )
}
