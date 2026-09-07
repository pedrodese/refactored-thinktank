import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { ClusterForm } from '@/pages/clusters/components/cluster-form'
import type { Cluster } from '@/types/cluster'

export default function ClustersEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: cluster, isLoading, error } = useApiQuery<Cluster>(id ? `/clusters/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar cluster"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Clusters', path: '/clusters' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {cluster && <ClusterForm cluster={cluster} />}
    </div>
  )
}
