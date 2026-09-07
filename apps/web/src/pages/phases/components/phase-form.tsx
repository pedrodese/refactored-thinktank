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
  phase?: Phase
}

export function PhaseForm({ phase }: Props) {
  const navigate = useNavigate()
  const { data: toolsResult } = useApiQuery<PaginatedResult<MethodologyTool>>('/tools?per=100')
  const toolOptions = (toolsResult?.data ?? []).map((tool) => ({ value: tool.id, label: tool.name }))

  const [name, setName] = useState(phase?.name ?? '')
  const [toolIds, setToolIds] = useState<string[]>(phase ? [...phase.toolIds] : [])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    try {
      if (phase) {
        await apiFetch(`/phases/${phase.id}`, { method: 'PATCH', body: { name, toolIds } })
      } else {
        await apiFetch('/phases', { method: 'POST', body: { name, toolIds } })
      }
      navigate('/phases')
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
          <FormField id="phase-name" label="Nome" value={name} onChange={setName} error={errors.name?.[0]} />

          <MultiSelectField
            id="phase-tool-ids"
            label="Ferramentas"
            options={toolOptions}
            value={toolIds}
            onChange={setToolIds}
            error={errors.toolIds?.[0]}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar fase
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/phases')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
