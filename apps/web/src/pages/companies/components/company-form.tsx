import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import type { Company } from '@/types/company'

// Sem o multiselect "Pessoas associadas" que a versão Rails tinha
// (company.user_ids) — a API nova só permite editar `companyId` a partir do
// usuário (PATCH /users/:id), não a partir da empresa. Editar essa associação
// pelo cadastro da pessoa, não daqui.
interface Props {
  company?: Company
}

export function CompanyForm({ company }: Props) {
  const navigate = useNavigate()
  const [name, setName] = useState(company?.name ?? '')
  const [cnpj, setCnpj] = useState(company?.cnpj ?? '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    try {
      if (company) {
        await apiFetch(`/companies/${company.id}`, { method: 'PATCH', body: { name, cnpj } })
      } else {
        await apiFetch('/companies', { method: 'POST', body: { name, cnpj } })
      }
      navigate('/companies')
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
          <FormField id="company-name" label="Nome" value={name} onChange={setName} error={errors.name?.[0]} />

          <FormField
            id="company-cnpj"
            label="CNPJ"
            description="Formato XX.XXX.XXX/XXXX-XX."
            value={cnpj}
            onChange={setCnpj}
            error={errors.cnpj?.[0]}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar empresa
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/companies')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
