import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { PhaseForm } from '@/pages/phases/components/phase-form'
import type { Phase } from '@/types/phase'

export default function PhasesEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: phase, isLoading, error } = useApiQuery<Phase>(id ? `/phases/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar fase"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Fases', path: '/phases' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {phase && <PhaseForm phase={phase} />}
    </div>
  )
}
