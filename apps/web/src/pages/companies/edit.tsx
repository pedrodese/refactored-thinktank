import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { CompanyForm } from '@/pages/companies/components/company-form'
import type { Company } from '@/types/company'

export default function CompaniesEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: company, isLoading, error } = useApiQuery<Company>(id ? `/companies/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar empresa"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Empresas', path: '/companies' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {company && <CompanyForm company={company} />}
    </div>
  )
}
