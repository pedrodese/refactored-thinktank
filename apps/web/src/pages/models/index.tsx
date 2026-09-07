import { Link, router } from '@inertiajs/react'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { TableCard } from '@/components/table-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ModelRow {
  id: number
  modelId: string
  name: string
  provider: string
  contextWindow: number | null
  inputPricePerMillion: number | null
  outputPricePerMillion: number | null
  path: string
  newChatPath: string
}

interface Props {
  models: readonly ModelRow[]
  chatsPath: string
  refreshPath: string
}

export default function ModelsIndex({ models, chatsPath, refreshPath }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Modelos"
        subtitle="Compare provedores, limites e custos antes de iniciar a conversa certa."
        breadcrumbs={[{ label: 'Dashboard', path: '/' }]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={chatsPath}>Conversas</Link>
            </Button>
            <Button onClick={() => router.post(refreshPath)}>Atualizar modelos</Button>
          </>
        }
      />

      {models.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Nenhum modelo disponível"
              message="Atualize a lista para buscar os modelos disponíveis para conversa."
            />
          </CardContent>
        </Card>
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provedor</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Janela de contexto</TableHead>
                <TableHead>$/1M tokens (entrada/saída)</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>{model.provider}</TableCell>
                  <TableCell>
                    <Link href={model.path} className="font-medium underline-offset-4 hover:underline">
                      {model.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{model.modelId}</p>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatCount(model.contextWindow)}</TableCell>
                  <TableCell className="tabular-nums">{formatPrices(model)}</TableCell>
                  <TableCell>
                    <Button size="sm" asChild>
                      <Link href={model.newChatPath}>Iniciar conversa</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}
    </div>
  )
}

// Grouped by the browser rather than by the server: a token count is a number,
// not a translated string, and Intl already knows what pt-BR does with it.
function formatCount(value: number | null) {
  return value === null ? '—' : value.toLocaleString('pt-BR')
}

function formatPrices({ inputPricePerMillion, outputPricePerMillion }: ModelRow) {
  if (inputPricePerMillion === null || outputPricePerMillion === null) return 'Indisponível'

  return `$${inputPricePerMillion.toFixed(2)} / $${outputPricePerMillion.toFixed(2)}`
}
