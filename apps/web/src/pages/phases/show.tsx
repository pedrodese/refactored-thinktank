import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { RelatedRecords } from '@/components/related-records'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApiQuery } from '@/lib/use-api-query'
import type { Meeting } from '@/types/meeting'
import type { MethodologyTool } from '@/types/methodology-tool'
import type { PaginatedResult } from '@/types/pagination'
import type { Phase } from '@/types/phase'

export default function PhasesShow() {
  const { id } = useParams<{ id: string }>()
  const { data: phase, isLoading, error } = useApiQuery<Phase>(id ? `/phases/${id}` : null)
  const { data: toolsResult } = useApiQuery<PaginatedResult<MethodologyTool>>('/tools?per=100')
  const { data: meetingsResult } = useApiQuery<PaginatedResult<Meeting>>(id ? `/meetings?phaseId=${id}&per=100` : null)

  const tools = (toolsResult?.data ?? []).filter((tool) => phase?.toolIds.includes(tool.id))
  const meetings = meetingsResult?.data ?? []

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!phase) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={phase.name}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Fases', path: '/phases' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/phases/${phase.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/phases">Voltar para Fases</Link>
            </Button>
          </>
        }
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <RelatedRecords
          title="Ferramentas"
          count={tools.length}
          emptyTitle="Nenhuma ferramenta nesta fase"
          emptyMessage="Associe ferramentas editando esta fase, ou a partir da própria ferramenta."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ferramenta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <Link to={`/tools/${tool.id}`} className="font-medium underline-offset-4 hover:underline">
                      {tool.name}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </RelatedRecords>

        <RelatedRecords
          title="Reuniões"
          count={meetings.length}
          emptyTitle="Nenhuma reunião nesta fase"
          emptyMessage="As reuniões aparecem aqui quando forem criadas apontando para esta fase."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reunião</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>
                    <Link to={`/meetings/${meeting.id}`} className="font-medium underline-offset-4 hover:underline">
                      {meeting.name}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </RelatedRecords>
      </div>
    </div>
  )
}
