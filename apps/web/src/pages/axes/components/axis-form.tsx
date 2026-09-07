import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { TextAreaField } from '@/components/text-area-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import type { Axis } from '@/types/axis'

interface Props {
  axis?: Axis
}

export function AxisForm({ axis }: Props) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(axis?.title ?? '')
  const [description, setDescription] = useState(axis?.description ?? '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    try {
      if (axis) {
        await apiFetch(`/axes/${axis.id}`, { method: 'PATCH', body: { title, description } })
      } else {
        await apiFetch('/axes', { method: 'POST', body: { title, description } })
      }
      navigate('/axes')
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
          <FormField id="axis-title" label="Título" value={title} onChange={setTitle} error={errors.title?.[0]} />

          <TextAreaField
            id="axis-description"
            label="Descrição"
            rows={5}
            value={description}
            onChange={setDescription}
            error={errors.description?.[0]}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar eixo
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/axes')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
