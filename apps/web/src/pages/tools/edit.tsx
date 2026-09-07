import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { ToolForm } from '@/pages/tools/components/tool-form'
import type { MethodologyTool } from '@/types/methodology-tool'

export default function ToolsEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: tool, isLoading, error } = useApiQuery<MethodologyTool>(id ? `/tools/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar ferramenta"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Ferramentas', path: '/tools' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {tool && <ToolForm tool={tool} />}
    </div>
  )
}
