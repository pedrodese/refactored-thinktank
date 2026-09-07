import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ApiError, apiFetch } from '@/lib/api-client'
import { WEEK_DAY_OPTIONS, weekDayToFormValue } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Chapter } from '@/types/chapter'
import type { Cluster } from '@/types/cluster'
import type { PaginatedResult } from '@/types/pagination'
import type { User } from '@/types/user'

interface Props {
  cluster?: Cluster
}

function orUndefined(value: string): string | undefined {
  return value || undefined
}

export function ClusterForm({ cluster }: Props) {
  const navigate = useNavigate()
  const { data: chaptersResult } = useApiQuery<PaginatedResult<Chapter>>('/chapters?per=100')
  const chapterOptions = (chaptersResult?.data ?? []).map((chapter) => ({ value: chapter.id, label: chapter.title }))
  // Facilitador e facilitador auxiliar são pessoas com autorização
  // `facilitator` (nível 2) — mesmo filtro que `AUTHORIZATION_LEVEL_OPTIONS`
  // usa pra montar o payload em `users/index.tsx`.
  const { data: facilitatorsResult } = useApiQuery<PaginatedResult<User>>('/users?authorizationLevel=2&per=100')
  const facilitatorOptions = (facilitatorsResult?.data ?? []).map((user) => ({ value: user.id, label: user.fullName }))

  const [chapterId, setChapterId] = useState(cluster?.chapterId ?? '')
  const [weekDay, setWeekDay] = useState(cluster ? weekDayToFormValue(cluster.weekDay) : '0')
  const [startDate, setStartDate] = useState(cluster?.startDate ?? '')
  const [endDate, setEndDate] = useState(cluster?.endDate ?? '')
  const [startTime, setStartTime] = useState(cluster?.startTime ?? '')
  const [endTime, setEndTime] = useState(cluster?.endTime ?? '')
  const [facilitatorId, setFacilitatorId] = useState(cluster?.facilitatorId ?? '')
  const [auxiliaryFacilitatorId, setAuxiliaryFacilitatorId] = useState(cluster?.auxiliaryFacilitatorId ?? '')
  const [address, setAddress] = useState(cluster?.address ?? '')
  const [link, setLink] = useState(cluster?.link ?? '')
  const [active, setActive] = useState(cluster?.active ?? true)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const payload = {
      chapterId,
      weekDay: Number(weekDay),
      startDate: orUndefined(startDate),
      endDate: orUndefined(endDate),
      startTime,
      endTime,
      facilitatorId,
      auxiliaryFacilitatorId: orUndefined(auxiliaryFacilitatorId),
      address: orUndefined(address),
      link: orUndefined(link),
      active,
    }

    try {
      if (cluster) {
        await apiFetch(`/clusters/${cluster.id}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch('/clusters', { method: 'POST', body: payload })
      }
      navigate('/clusters')
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
            id="cluster-chapter-id"
            label="Capítulo"
            options={chapterOptions}
            value={chapterId}
            onChange={setChapterId}
            blankLabel="Selecione o capítulo"
            error={errors.chapterId?.[0]}
          />

          <SelectField
            id="cluster-week-day"
            label="Dia da semana"
            options={WEEK_DAY_OPTIONS}
            value={weekDay}
            onChange={setWeekDay}
            error={errors.weekDay?.[0]}
          />

          <FormField id="cluster-start-date" label="Data de início" type="date" value={startDate} onChange={setStartDate} error={errors.startDate?.[0]} />

          <FormField id="cluster-end-date" label="Data de término" type="date" value={endDate} onChange={setEndDate} error={errors.endDate?.[0]} />

          <FormField
            id="cluster-start-time"
            label="Horário de início"
            type="time"
            value={startTime}
            onChange={setStartTime}
            error={errors.startTime?.[0]}
          />

          <FormField id="cluster-end-time" label="Horário de término" type="time" value={endTime} onChange={setEndTime} error={errors.endTime?.[0]} />

          <SelectField
            id="cluster-facilitator-id"
            label="Facilitador"
            options={facilitatorOptions}
            value={facilitatorId}
            onChange={setFacilitatorId}
            blankLabel="Selecione o facilitador"
            error={errors.facilitatorId?.[0]}
          />

          <SelectField
            id="cluster-auxiliary-facilitator-id"
            label="Facilitador auxiliar"
            options={facilitatorOptions}
            value={auxiliaryFacilitatorId}
            onChange={setAuxiliaryFacilitatorId}
            blankLabel="Nenhum"
            error={errors.auxiliaryFacilitatorId?.[0]}
          />

          <div className="md:col-span-2">
            <FormField id="cluster-address" label="Endereço" value={address} onChange={setAddress} error={errors.address?.[0]} />
          </div>

          <div className="md:col-span-2">
            <FormField id="cluster-link" label="Link" type="url" value={link} onChange={setLink} error={errors.link?.[0]} />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="cluster-active"
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <Label htmlFor="cluster-active">Ativo</Label>
          </div>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar cluster
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/clusters')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
