import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SelectField } from '@/components/select-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ApiError, apiFetch } from '@/lib/api-client'
import { MEMBER_MODALITY_OPTIONS, MEMBER_ROLE_OPTIONS, memberModalityToFormValue, memberRoleToFormValue } from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Member } from '@/types/member'
import type { PaginatedResult } from '@/types/pagination'
import type { User } from '@/types/user'

interface Props {
  teamId: string
  member?: Member
}

export function MembershipForm({ teamId, member }: Props) {
  const navigate = useNavigate()
  const { data: usersResult } = useApiQuery<PaginatedResult<User>>('/users?per=100')
  const userOptions = (usersResult?.data ?? []).map((user) => ({ value: user.id, label: user.fullName }))

  const [userId, setUserId] = useState(member?.userId ?? '')
  const [role, setRole] = useState(member ? memberRoleToFormValue(member.role) : '2')
  const [modality, setModality] = useState(member ? memberModalityToFormValue(member.modality) : '0')
  const [active, setActive] = useState(member?.active ?? true)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    const payload = { userId, role: Number(role), modality: Number(modality), active }
    try {
      if (member) {
        await apiFetch(`/teams/${teamId}/members/${member.id}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch(`/teams/${teamId}/members`, { method: 'POST', body: payload })
      }
      navigate(`/teams/${teamId}`)
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
            id="membership-user-id"
            label="Pessoa"
            options={userOptions}
            value={userId}
            onChange={setUserId}
            blankLabel="Selecione a pessoa"
            error={errors.userId?.[0]}
          />

          <SelectField id="membership-role" label="Função" options={MEMBER_ROLE_OPTIONS} value={role} onChange={setRole} error={errors.role?.[0]} />

          <SelectField
            id="membership-modality"
            label="Modalidade"
            options={MEMBER_MODALITY_OPTIONS}
            value={modality}
            onChange={setModality}
            error={errors.modality?.[0]}
          />

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="membership-active"
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <Label htmlFor="membership-active">Ativo</Label>
          </div>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar membro
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(`/teams/${teamId}`)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
