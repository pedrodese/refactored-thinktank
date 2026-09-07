import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import { useApiQuery } from '@/lib/use-api-query'
import type { Meeting } from '@/types/meeting'
import type { PaginatedResult } from '@/types/pagination'
import type { Phase } from '@/types/phase'

interface Props {
  meeting?: Meeting
}

export function MeetingForm({ meeting }: Props) {
  const navigate = useNavigate()
  const { data: phasesResult } = useApiQuery<PaginatedResult<Phase>>('/phases?per=100')
  const phaseOptions = (phasesResult?.data ?? []).map((phase) => ({ value: phase.id, label: phase.name }))

  const [name, setName] = useState(meeting?.name ?? '')
  const [abbreviation, setAbbreviation] = useState(meeting?.abbreviation ?? '')
  const [phaseId, setPhaseId] = useState(meeting?.phaseId ?? '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    try {
      if (meeting) {
        await apiFetch(`/meetings/${meeting.id}`, { method: 'PATCH', body: { name, abbreviation, phaseId } })
      } else {
        await apiFetch('/meetings', { method: 'POST', body: { name, abbreviation, phaseId } })
      }
      navigate('/meetings')
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
          <FormField
            id="meeting-abbreviation"
            label="Abreviação"
            value={abbreviation}
            onChange={setAbbreviation}
            error={errors.abbreviation?.[0]}
          />

          <FormField id="meeting-name" label="Título" value={name} onChange={setName} error={errors.name?.[0]} />

          <SelectField
            id="meeting-phase-id"
            label="Fase"
            options={phaseOptions}
            value={phaseId}
            onChange={setPhaseId}
            blankLabel="Selecione a fase"
            error={errors.phaseId?.[0]}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar reunião
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/meetings')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
