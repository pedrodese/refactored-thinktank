import { PageHeader } from '@/components/page-header'
import { UserForm } from '@/pages/users/components/user-form'

export default function UsersNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova pessoa"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Pessoas', path: '/users' },
        ]}
      />
      <UserForm />
    </div>
  )
}
