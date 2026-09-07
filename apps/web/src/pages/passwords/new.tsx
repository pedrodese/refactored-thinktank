import { Link } from '@inertiajs/react'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AuthLayout from '@/layouts/auth-layout'

interface Props {
  email: string
  errors?: { email?: string }
  submitPath: string
  signInPath: string
  authenticityToken: string
}

export default function PasswordsNew({ email, errors, submitPath, signInPath, authenticityToken }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Recuperar senha</h1>
        <p className="text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos as instruções para definir uma nova senha.
        </p>
        <form action={submitPath} method="post" className="flex flex-col gap-4">
          <input type="hidden" name="authenticity_token" value={authenticityToken} />

          <FormField
            id="user-email"
            name="user[email]"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            error={errors?.email}
          />

          <Button type="submit">Enviar instruções</Button>
        </form>
        <Button variant="link" asChild className="self-start px-0">
          <Link href={signInPath}>Voltar para o login</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

PasswordsNew.layout = AuthLayout
