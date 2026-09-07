import { PageHeader } from '@/components/page-header'
import { ToolForm } from '@/pages/tools/components/tool-form'

export default function ToolsNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova ferramenta"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Ferramentas', path: '/tools' },
        ]}
      />
      <ToolForm />
    </div>
  )
}
