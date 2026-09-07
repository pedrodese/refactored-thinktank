import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { RelatedRecords } from '@/components/related-records'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApiQuery } from '@/lib/use-api-query'
import type { Chapter } from '@/types/chapter'
import type { PaginatedResult } from '@/types/pagination'

interface ClusterSummary {
  readonly id: string
  readonly name: string
}

export default function ChaptersShow() {
  const { id } = useParams<{ id: string }>()
  const { data: chapter, isLoading, error } = useApiQuery<Chapter>(id ? `/chapters/${id}` : null)
  const { data: clustersResult } = useApiQuery<PaginatedResult<ClusterSummary>>(id ? `/clusters?chapterId=${id}&per=100` : null)
  const clusters = clustersResult?.data ?? []

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!chapter) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={chapter.title}
        subtitle={`Ano da edição: ${chapter.editionYear}`}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Capítulos', path: '/chapters' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/chapters/${chapter.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/chapters">Voltar para Capítulos</Link>
            </Button>
          </>
        }
      />

      <RelatedRecords
        title="Clusters"
        count={clusters.length}
        emptyTitle="Nenhum cluster nesta edição"
        emptyMessage="Os clusters aparecem aqui quando forem criados apontando para este capítulo."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cluster</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clusters.map((cluster) => (
              <TableRow key={cluster.id}>
                <TableCell>
                  <Link to={`/clusters/${cluster.id}`} className="font-medium underline-offset-4 hover:underline">
                    {cluster.name}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RelatedRecords>
    </div>
  )
}
