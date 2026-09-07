import type { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * A labelled text control with its hint and its server-side error. Both are
 * associated through aria-describedby here so no screen has to remember to do
 * it, and the server remains the only authority on validity — this renders what
 * it said. `required` is a hint to the person filling the form, marked with a
 * word rather than an asterisk, and never a client-side gate.
 *
 * With `onChange` the field is controlled, which is what a form driven by
 * useForm needs. Without it the field is uncontrolled and posts under `name`,
 * which is what the authentication screens need: they submit as ordinary
 * browser forms, so the value belongs to the form and not to React.
 */
interface Props {
  id: string
  label: string
  value: string
  onChange?: (value: string) => void
  name?: string
  description?: string
  error?: string
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'date' | 'time' | 'url'
  autoComplete?: string
}

export function FormField({
  id,
  label,
  value,
  onChange,
  name,
  description,
  error,
  required = false,
  type = 'text',
  autoComplete,
}: Props) {
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy = [description && descriptionId, error && errorId].filter(Boolean).join(' ')
  const binding = onChange
    ? { value, onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value) }
    : { defaultValue: value }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-xs font-normal text-muted-foreground">obrigatório</span>}
      </Label>
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...binding}
      />
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
