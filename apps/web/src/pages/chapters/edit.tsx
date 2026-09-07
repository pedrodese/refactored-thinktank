import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { useApiQuery } from '@/lib/use-api-query'
import { ChapterForm } from '@/pages/chapters/components/chapter-form'
import type { Chapter } from '@/types/chapter'

export default function ChaptersEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: chapter, isLoading, error } = useApiQuery<Chapter>(id ? `/chapters/${id}` : null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar capítulo"
        subtitle="Atualize os dados e salve quando terminar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Capítulos', path: '/chapters' },
        ]}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {chapter && <ChapterForm chapter={chapter} />}
    </div>
  )
}
