import { Link } from '@inertiajs/react'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  model: {
    modelId: string
    name: string
    provider: string
    contextWindow: number | null
    maxOutputTokens: number | null
    capabilities: readonly string[]
    newChatPath: string
  }
  modelsPath: string
}

export default function ModelsShow({ model, modelsPath }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Detalhes do modelo"
        subtitle={`${model.name} · ${model.provider}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Modelos', path: modelsPath }
        ]}
        actions={
          <Button asChild>
            <Link href={model.newChatPath}>Iniciar conversa com este modelo</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{model.modelId}</p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Fact label="Janela de contexto" value={model.contextWindow} />
            <Fact label="Tokens de saída" value={model.maxOutputTokens} />
          </dl>
          {model.capabilities.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Capacidades</p>
              <div className="flex flex-wrap gap-2">
                {model.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value === null ? '—' : value.toLocaleString('pt-BR')}</dd>
    </div>
  )
}
