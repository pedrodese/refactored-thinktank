import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { AxisForm } from '@/pages/axes/components/axis-form'
import type { Axis } from '@/types/axis'

export default function AxesEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: axis, isLoading, error } = useApiQuery<Axis>(id ? `/axes/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar eixo"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Eixos', path: '/axes' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {axis && <AxisForm axis={axis} />}
    </div>
  )
}
