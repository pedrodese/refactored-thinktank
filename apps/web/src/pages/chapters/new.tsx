import { PageHeader } from '@/components/page-header'
import { ChapterForm } from '@/pages/chapters/components/chapter-form'

export default function ChaptersNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo capítulo"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Capítulos', path: '/chapters' },
        ]}
      />
      <ChapterForm />
    </div>
  )
}
