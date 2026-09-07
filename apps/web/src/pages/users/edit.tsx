import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { UserForm } from '@/pages/users/components/user-form'
import type { User } from '@/types/user'

export default function UsersEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: user, isLoading, error } = useApiQuery<User>(id ? `/users/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar pessoa"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Pessoas', path: '/users' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {user && <UserForm user={user} />}
    </div>
  )
}
