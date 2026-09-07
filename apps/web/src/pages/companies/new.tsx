import { PageHeader } from '@/components/page-header'
import { CompanyForm } from '@/pages/companies/components/company-form'

export default function CompaniesNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova empresa"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Empresas', path: '/companies' },
        ]}
      />
      <CompanyForm />
    </div>
  )
}
