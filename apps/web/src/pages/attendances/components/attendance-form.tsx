import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SelectField } from '@/components/select-field'
import { TextAreaField } from '@/components/text-area-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import { ATTENDANCE_STATUS_OPTIONS, attendanceStatusToFormValue } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Attendance } from '@/types/attendance'
import type { Event } from '@/types/event'
import type { Member } from '@/types/member'
import type { PaginatedResult } from '@/types/pagination'

interface Props {
  eventId: string
  attendance?: Attendance
}

export function AttendanceForm({ eventId, attendance }: Props) {
  const navigate = useNavigate()
  const { data: event } = useApiQuery<Event>(`/events/${eventId}`)
  const { data: membersResult } = useApiQuery<PaginatedResult<Member>>(event?.teamId ? `/teams/${event.teamId}/members?per=100` : null)
  const memberOptions = (membersResult?.data ?? []).map((member) => ({ value: member.id, label: member.user?.fullName ?? member.id }))

  const [memberId, setMemberId] = useState(attendance?.memberId ?? '')
  const [status, setStatus] = useState(attendance ? attendanceStatusToFormValue(attendance.status) : '0')
  const [reason, setReason] = useState(attendance?.reason ?? '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (submitEvent: FormEvent) => {
    submitEvent.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    const payload = { memberId, status: Number(status), reason }
    try {
      if (attendance) {
        await apiFetch(`/events/${eventId}/attendances/${attendance.id}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch(`/events/${eventId}/attendances`, { method: 'POST', body: payload })
      }
      navigate(`/events/${eventId}/attendances`)
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
            id="attendance-member-id"
            label="Membro"
            options={memberOptions}
            value={memberId}
            onChange={setMemberId}
            blankLabel="Selecione o membro"
            error={errors.memberId?.[0]}
          />

          <SelectField
            id="attendance-status"
            label="Situação"
            options={ATTENDANCE_STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            error={errors.status?.[0]}
          />

          <div className="md:col-span-2">
            <TextAreaField id="attendance-reason" label="Motivo" rows={2} value={reason} onChange={setReason} error={errors.reason?.[0]} />
          </div>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar presença
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(`/events/${eventId}/attendances`)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
