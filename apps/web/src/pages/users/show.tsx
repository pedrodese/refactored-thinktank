import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AUTHORIZATION_LEVEL_LABEL, GENDER_LABEL } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Company } from '@/types/company'
import type { User } from '@/types/user'

// Sem a seção "Equipes" que a versão Rails tinha: a API nova só permite listar
// membros a partir de uma equipe específica (`/teams/:teamId/members`), não
// existe um jeito de perguntar "quais equipes esta pessoa integra". Repor se/
// quando a API ganhar esse endpoint.
export default function UsersShow() {
  const { id } = useParams<{ id: string }>()
  const { data: user, isLoading, error } = useApiQuery<User>(id ? `/users/${id}` : null)
  const { data: company } = useApiQuery<Company>(user?.companyId ? `/companies/${user.companyId}` : null)

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={user.fullName}
        subtitle={user.email || undefined}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Pessoas', path: '/users' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/users/${user.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/users">Voltar para Pessoas</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="neutral">{AUTHORIZATION_LEVEL_LABEL[user.authorizationLevel] ?? user.authorizationLevel}</StatusBadge>
            {company && (
              <Link to={`/companies/${company.id}`} className="text-sm underline-offset-4 hover:underline">
                {company.name}
              </Link>
            )}
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Apelido" value={user.nickname} />
            <Field label="E-mail secundário" value={user.secondaryEmail} />
            <Field label="Celular" value={user.celularNumber} />
            <Field label="Telefone" value={user.phoneNumber} />
            <Field label="Endereço" value={user.address} />
            <Field label="Aniversário" value={user.birthday} />
            <Field label="CPF" value={user.cpf} />
            <Field label="RG" value={user.rg} />
            <Field label="Gênero" value={GENDER_LABEL[user.gender] ?? user.gender} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string | null
}

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
}
