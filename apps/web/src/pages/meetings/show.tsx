import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApiQuery } from '@/lib/use-api-query'
import type { Meeting } from '@/types/meeting'
import type { Phase } from '@/types/phase'

export default function MeetingsShow() {
  const { id } = useParams<{ id: string }>()
  const { data: meeting, isLoading, error } = useApiQuery<Meeting>(id ? `/meetings/${id}` : null)
  const { data: phase } = useApiQuery<Phase>(meeting?.phaseId ? `/phases/${meeting.phaseId}` : null)

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>
  if (!meeting) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={meeting.name}
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Reuniões', path: '/meetings' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/meetings/${meeting.id}/edit`}>Editar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/meetings">Voltar para Reuniões</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Abreviação</dt>
              <dd>{meeting.abbreviation || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Fase</dt>
              <dd>
                {phase ? (
                  <Link to={`/phases/${phase.id}`} className="underline-offset-4 hover:underline">
                    {phase.name}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
