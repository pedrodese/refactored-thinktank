import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SelectField } from '@/components/select-field'
import { TextAreaField } from '@/components/text-area-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import { TOOL_ASSESSMENT_SCORE_OPTIONS, toolAssessmentScoreToFormValue } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { PaginatedResult } from '@/types/pagination'
import type { MethodologyTool } from '@/types/methodology-tool'
import type { ToolEventAssessment } from '@/types/tool-event-assessment'

interface Props {
  eventId: string
  assessment?: ToolEventAssessment
}

const COMMENT_LIMIT = 280

export function ToolEventAssessmentForm({ eventId, assessment }: Props) {
  const navigate = useNavigate()
  const { data: toolsResult } = useApiQuery<PaginatedResult<MethodologyTool>>('/tools?per=100')
  const toolOptions = (toolsResult?.data ?? []).map((tool) => ({ value: tool.id, label: tool.name }))

  const [toolId, setToolId] = useState(assessment?.toolId ?? '')
  const [score, setScore] = useState(assessment ? toolAssessmentScoreToFormValue(assessment.score) : '')
  const [comment, setComment] = useState(assessment?.comment ?? '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    const payload = { toolId, score: Number(score), comment }
    try {
      if (assessment) {
        await apiFetch(`/events/${eventId}/tool-event-assessments/${assessment.id}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch(`/events/${eventId}/tool-event-assessments`, { method: 'POST', body: payload })
      }
      navigate(`/events/${eventId}`)
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
          <SelectField
            id="tool-event-assessment-tool-id"
            label="Ferramenta"
            options={toolOptions}
            value={toolId}
            onChange={setToolId}
            blankLabel="Selecione a ferramenta"
            error={errors.toolId?.[0]}
          />

          <SelectField
            id="tool-event-assessment-score"
            label="Nota"
            options={TOOL_ASSESSMENT_SCORE_OPTIONS}
            value={score}
            onChange={setScore}
            blankLabel="Sem nota"
            error={errors.score?.[0]}
          />

          <div className="md:col-span-2">
            <TextAreaField
              id="tool-event-assessment-comment"
              label="Comentário"
              value={comment}
              onChange={setComment}
              maxLength={COMMENT_LIMIT}
              error={errors.comment?.[0]}
            />
          </div>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar avaliação
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(`/events/${eventId}`)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
