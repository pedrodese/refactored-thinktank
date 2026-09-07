import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import { EDITION_YEAR_OPTIONS } from '@/lib/labels'
import type { Chapter } from '@/types/chapter'

interface Props {
  chapter?: Chapter
}

export function ChapterForm({ chapter }: Props) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(chapter?.title ?? '')
  const [editionYear, setEditionYear] = useState(chapter ? String(chapter.editionYear) : '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    const payload = { title, editionYear: Number(editionYear) }
    try {
      if (chapter) {
        await apiFetch(`/chapters/${chapter.id}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch('/chapters', { method: 'POST', body: payload })
      }
      navigate('/chapters')
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
          <FormField id="chapter-title" label="Título" value={title} onChange={setTitle} error={errors.title?.[0]} />

          <SelectField
            id="chapter-edition-year"
            label="Ano da edição"
            options={EDITION_YEAR_OPTIONS}
            value={editionYear}
            onChange={setEditionYear}
            blankLabel="Selecione o ano"
            error={errors.editionYear?.[0]}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar capítulo
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/chapters')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
