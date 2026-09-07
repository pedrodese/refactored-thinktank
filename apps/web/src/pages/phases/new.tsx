import { PageHeader } from '@/components/page-header'
import { PhaseForm } from '@/pages/phases/components/phase-form'

export default function PhasesNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova fase"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Fases', path: '/phases' },
        ]}
      />
      <PhaseForm />
    </div>
  )
}
