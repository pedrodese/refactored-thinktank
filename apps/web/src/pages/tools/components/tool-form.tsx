import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { MultiSelectField } from '@/components/multi-select-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import { useApiQuery } from '@/lib/use-api-query'
import type { PaginatedResult } from '@/types/pagination'
import type { Phase } from '@/types/phase'
import type { MethodologyTool } from '@/types/methodology-tool'

interface Props {
  tool?: MethodologyTool
}

export function ToolForm({ tool }: Props) {
  const navigate = useNavigate()
  const { data: phasesResult } = useApiQuery<PaginatedResult<Phase>>('/phases?per=100')
  const phaseOptions = (phasesResult?.data ?? []).map((phase) => ({ value: phase.id, label: phase.name }))

  const [name, setName] = useState(tool?.name ?? '')
  const [phaseIds, setPhaseIds] = useState<string[]>(tool ? [...tool.phaseIds] : [])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    try {
      if (tool) {
        await apiFetch(`/tools/${tool.id}`, { method: 'PATCH', body: { name, phaseIds } })
      } else {
        await apiFetch('/tools', { method: 'POST', body: { name, phaseIds } })
      }
      navigate('/tools')
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
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField id="tool-name" label="Nome" value={name} onChange={setName} error={errors.name?.[0]} />

          <MultiSelectField
            id="tool-phase-ids"
            label="Fases"
            options={phaseOptions}
            value={phaseIds}
            onChange={setPhaseIds}
            error={errors.phaseIds?.[0]}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar ferramenta
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/tools')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
