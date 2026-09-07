import { Link } from '@inertiajs/react'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AuthLayout from '@/layouts/auth-layout'

interface Props {
  resetPasswordToken: string
  errors?: { reset_password_token?: string; password?: string; password_confirmation?: string }
  submitPath: string
  signInPath: string
  authenticityToken: string
}

export default function PasswordsEdit({
  resetPasswordToken,
  errors,
  submitPath,
  signInPath,
  authenticityToken
}: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Definir nova senha</h1>
        {/* A token rejected as invalid or expired has no field of its own to
            fail against, so its message is announced above the two that do. */}
        {errors?.reset_password_token && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errors.reset_password_token}
          </p>
        )}
        <form action={submitPath} method="post" className="flex flex-col gap-4">
          <input type="hidden" name="_method" value="put" />
          <input type="hidden" name="authenticity_token" value={authenticityToken} />
          <input type="hidden" name="user[reset_password_token]" value={resetPasswordToken} />

          <FormField
            id="user-password"
            name="user[password]"
            label="Senha"
            type="password"
            autoComplete="new-password"
            value=""
            error={errors?.password}
          />

          <FormField
            id="user-password-confirmation"
            name="user[password_confirmation]"
            label="Confirme sua senha"
            type="password"
            autoComplete="new-password"
            value=""
            error={errors?.password_confirmation}
          />

          <Button type="submit">Salvar nova senha</Button>
        </form>
        <Button variant="link" asChild className="self-start px-0">
          <Link href={signInPath}>Voltar para o login</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

PasswordsEdit.layout = AuthLayout
