import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FlashMessage } from '@/components/flash-message'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import AuthLayout from '@/layouts/auth-layout'

// Antes era um <form action="..." method="post"> comum apontando pro Devise,
// com um authenticity_token — não existe mais CSRF/sessão de cookie aqui, então
// virou um form controlado chamando POST /auth/login via fetch. A recusa que o
// Devise devolvia como flash chega como ApiError e é renderizada no mesmo lugar
// em que o AuthLayout renderizava o flash.
export default function SessionsNew() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password, rememberMe)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      {error && <FlashMessage tone="alert">{error}</FlashMessage>}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm text-muted-foreground">
            Use o e-mail com que você foi cadastrado no programa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          {/* Era uma linha com duas decisões: ficar logado e recuperar a senha.
              A segunda saiu porque a API nova ainda não tem reset de senha
              (/auth só expõe login, refresh e logout) — um link pra tela de
              recuperação seria um beco sem saída. */}
          <Label htmlFor="user-remember-me" className="font-normal">
            <input
              id="user-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            Lembre-se de mim
          </Label>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
