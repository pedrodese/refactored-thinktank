import { PageHeader } from '@/components/page-header'
import { AxisForm } from '@/pages/axes/components/axis-form'

export default function AxesNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo eixo"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eixos', path: '/axes' },
        ]}
      />
      <AxisForm />
    </div>
  )
}
