import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api-client'
import {
  AUTHORIZATION_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  authorizationLevelToFormValue,
  genderToFormValue,
} from '@/lib/labels'
import { useApiQuery } from '@/lib/use-api-query'
import type { Company } from '@/types/company'
import type { PaginatedResult } from '@/types/pagination'
import type { User } from '@/types/user'

// Sem upload de foto (o backend ainda não tem storage/avatar — Fase 5,
// pendente) e sem "senha de confirmação" no payload (é só uma checagem no
// cliente antes de enviar; o backend não tem esse campo).
interface Props {
  user?: User
}

function orUndefined(value: string): string | undefined {
  return value || undefined
}

export function UserForm({ user }: Props) {
  const navigate = useNavigate()
  const { data: companiesResult } = useApiQuery<PaginatedResult<Company>>('/companies?per=100')
  const companyOptions = (companiesResult?.data ?? []).map((company) => ({ value: company.id, label: company.name }))

  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [secondaryEmail, setSecondaryEmail] = useState(user?.secondaryEmail ?? '')
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [celularNumber, setCelularNumber] = useState(user?.celularNumber ?? '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '')
  const [address, setAddress] = useState(user?.address ?? '')
  const [cpf, setCpf] = useState(user?.cpf ?? '')
  const [rg, setRg] = useState(user?.rg ?? '')
  const [birthdayInput, setBirthdayInput] = useState(user?.birthday ?? '')
  const [companyId, setCompanyId] = useState(user?.companyId ?? '')
  const [gender, setGender] = useState(user ? genderToFormValue(user.gender) : '2')
  const [authorizationLevel, setAuthorizationLevel] = useState(
    user ? authorizationLevelToFormValue(user.authorizationLevel) : '0',
  )
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requiresPassword = authorizationLevel !== '0'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrors({})

    if (password && password !== passwordConfirmation) {
      setErrors({ password: ['as senhas não coincidem'] })
      return
    }

    const payload: Record<string, unknown> = {
      fullName,
      authorizationLevel: Number(authorizationLevel),
      gender: Number(gender),
      email: orUndefined(email),
      secondaryEmail: orUndefined(secondaryEmail),
      nickname: orUndefined(nickname),
      cpf: orUndefined(cpf),
      rg: orUndefined(rg),
      birthdayInput: orUndefined(birthdayInput),
      address: orUndefined(address),
      celularNumber: orUndefined(celularNumber),
      phoneNumber: orUndefined(phoneNumber),
      companyId: orUndefined(companyId),
    }
    if (password) payload.password = password

    setIsSubmitting(true)
    try {
      if (user) {
        await apiFetch(`/users/${user.id}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch('/users', { method: 'POST', body: payload })
      }
      navigate('/users')
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors)
      else window.alert(err instanceof ApiError ? err.message : 'Não foi possível salvar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <section className="flex flex-col gap-4">
            <SectionHeading
              title="Identificação principal"
              description="Comece pelo essencial para que a pessoa apareça corretamente nas listas."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField
                  id="user-full-name"
                  label="Nome"
                  value={fullName}
                  onChange={setFullName}
                  error={errors.fullName?.[0]}
                  required
                />
              </div>
              <FormField
                id="user-email"
                label="E-mail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                error={errors.email?.[0]}
              />
              <FormField
                id="user-secondary-email"
                label="E-mail secundário"
                type="email"
                value={secondaryEmail}
                onChange={setSecondaryEmail}
                error={errors.secondaryEmail?.[0]}
              />
              <FormField id="user-nickname" label="Apelido" value={nickname} onChange={setNickname} error={errors.nickname?.[0]} />
              <FormField
                id="user-celular-number"
                label="Celular"
                value={celularNumber}
                onChange={setCelularNumber}
                error={errors.celularNumber?.[0]}
              />
              <FormField
                id="user-phone-number"
                label="Telefone"
                value={phoneNumber}
                onChange={setPhoneNumber}
                error={errors.phoneNumber?.[0]}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeading
              title="Documentos e contexto"
              description="Preencha apenas o que ajuda a identificar e contatar a pessoa."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id="user-address" label="Endereço" value={address} onChange={setAddress} error={errors.address?.[0]} />
              <FormField id="user-cpf" label="CPF" value={cpf} onChange={setCpf} error={errors.cpf?.[0]} />
              <FormField id="user-rg" label="RG" value={rg} onChange={setRg} error={errors.rg?.[0]} />
              <FormField
                id="user-birthday-input"
                label="Aniversário"
                type="date"
                value={birthdayInput ?? ''}
                onChange={setBirthdayInput}
                error={errors.birthdayInput?.[0]}
              />
              <SelectField
                id="user-company-id"
                label="Empresa"
                options={companyOptions}
                value={companyId ?? ''}
                onChange={setCompanyId}
                blankLabel="Nenhuma"
                error={errors.companyId?.[0]}
              />
              <SelectField id="user-gender" label="Gênero" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeading
              title="Acesso e segurança"
              description="As senhas aparecem apenas quando a pessoa precisa entrar no sistema."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                id="user-authorization-level"
                label="Autorização"
                options={AUTHORIZATION_LEVEL_OPTIONS}
                value={authorizationLevel}
                onChange={setAuthorizationLevel}
                error={errors.authorizationLevel?.[0]}
              />
              {requiresPassword && (
                <>
                  <FormField
                    id="user-password"
                    label="Senha"
                    type="password"
                    autoComplete="new-password"
                    description={user ? 'Deixe em branco para não alterar.' : undefined}
                    value={password}
                    onChange={setPassword}
                    error={errors.password?.[0]}
                  />
                  <FormField
                    id="user-password-confirmation"
                    label="Confirmação da senha"
                    type="password"
                    autoComplete="new-password"
                    value={passwordConfirmation}
                    onChange={setPasswordConfirmation}
                  />
                </>
              )}
            </div>
          </section>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Salvar pessoa
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/users')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface SectionHeadingProps {
  title: string
  description: string
}

function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
