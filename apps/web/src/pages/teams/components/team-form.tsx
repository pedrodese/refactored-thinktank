import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import { useApiQuery } from '@/lib/use-api-query'
import type { Axis } from '@/types/axis'
import type { Cluster } from '@/types/cluster'
import type { PaginatedResult } from '@/types/pagination'
import type { Team } from '@/types/team'

// Sem a seção de membros que a versão Rails editava aqui (nested-attributes
// com `_destroy`) — a API expõe `Member` só como sub-recurso de `Team`
// (`/teams/:teamId/members`, sem endpoint aninhado no create/update de Team),
// decisão consciente da Fase 3. Membros são geridos a partir de `teams/show`.
interface Props {
  team?: Team
}

export function TeamForm({ team }: Props) {
  const navigate = useNavigate()
  const { data: axesResult } = useApiQuery<PaginatedResult<Axis>>('/axes?per=100')
  const axisOptions = (axesResult?.data ?? []).map((axis) => ({ value: axis.id, label: axis.title }))
  const { data: clustersResult } = useApiQuery<PaginatedResult<Cluster>>('/clusters?status=all&per=100')
  const clusterOptions = (clustersResult?.data ?? []).map((cluster) => ({ value: cluster.id, label: cluster.name }))

  const [name, setName] = useState(team?.name ?? '')
  const [axisId, setAxisId] = useState(team?.axisId ?? '')
  const [clusterId, setClusterId] = useState(team?.clusterId ?? '')
  const [linkMiro, setLinkMiro] = useState(team?.linkMiro ?? '')
  const [linkTeams, setLinkTeams] = useState(team?.linkTeams ?? '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    const payload = { name, axisId, clusterId, linkMiro, linkTeams }
    try {
      if (team) {
        await apiFetch(`/teams/${team.id}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch('/teams', { method: 'POST', body: payload })
      }
      navigate('/teams')
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors)
      else window.alert(err instanceof ApiError ? err.message : 'Não foi possível salvar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <FormField id="team-name" label="Nome" value={name} onChange={setName} error={errors.name?.[0]} />

          <SelectField
            id="team-axis-id"
            label="Eixo"
            options={axisOptions}
            value={axisId}
            onChange={setAxisId}
            blankLabel="Selecione o eixo"
            error={errors.axisId?.[0]}
          />

          <div className="md:col-span-2">
            <SelectField
              id="team-cluster-id"
              label="Cluster"
              options={clusterOptions}
              value={clusterId}
              onChange={setClusterId}
              blankLabel="Selecione o cluster"
              error={errors.clusterId?.[0]}
            />
          </div>

          <FormField
            id="team-link-miro"
            label="Link Miro"
            type="url"
            value={linkMiro}
            onChange={setLinkMiro}
            error={errors.linkMiro?.[0]}
          />

          <FormField
            id="team-link-teams"
            label="Link Teams"
            type="url"
            value={linkTeams}
            onChange={setLinkTeams}
            error={errors.linkTeams?.[0]}
          />

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar equipe
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/teams')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
