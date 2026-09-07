import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import AuthLayout from '@/layouts/auth-layout'

// Antes era um <form action="..." method="post"> comum apontando pro
// Devise, com um authenticity_token — não existe mais CSRF/sessão de cookie
// aqui, então virou um form controlado chamando POST /auth/login via fetch.
export default function SessionsNew() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold">Entrar</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              id="user-email"
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              required
            />
            <FormField
              id="user-password"
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              required
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
