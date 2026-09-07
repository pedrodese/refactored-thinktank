import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { RelatedRecords } from '@/components/related-records'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApiQuery } from '@/lib/use-api-query'
import type { MethodologyTool } from '@/types/methodology-tool'
import type { PaginatedResult } from '@/types/pagination'
import type { Phase } from '@/types/phase'

export default function ToolsShow() {
  const { id } = useParams<{ id: string }>()
  const { data: tool, isLoading, error } = useApiQuery<MethodologyTool>(id ? `/tools/${id}` : null)
  const { data: phasesResult } = useApiQuery<PaginatedResult<Phase>>('/phases?per=100')
  const phases = (phasesResult?.data ?? []).filter((phase) => tool?.phaseIds.includes(phase.id))

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!tool) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={tool.name}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Ferramentas', path: '/tools' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/tools/${tool.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/tools">Voltar para Ferramentas</Link>
            </Button>
          </>
        }
      />

      <RelatedRecords
        title="Fases"
        count={phases.length}
        emptyTitle="Nenhuma fase usa esta ferramenta"
        emptyMessage="Associe fases editando esta ferramenta, ou a partir da própria fase."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phases.map((phase) => (
              <TableRow key={phase.id}>
                <TableCell>
                  <Link to={`/phases/${phase.id}`} className="font-medium underline-offset-4 hover:underline">
                    {phase.name}
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
