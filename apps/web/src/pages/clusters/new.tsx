import { PageHeader } from '@/components/page-header'
import { ClusterForm } from '@/pages/clusters/components/cluster-form'

export default function ClustersNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo cluster"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Clusters', path: '/clusters' },
        ]}
      />
      <ClusterForm />
    </div>
  )
}
