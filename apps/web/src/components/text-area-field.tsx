import { Label } from '@/components/ui/label'

/**
 * A labelled textarea with its server-side error and, when a limit is given,
 * the count as the person types. The count is a courtesy: the server enforces
 * the limit, and this only says how close the text is to it.
 */
interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  maxLength?: number
  error?: string
  disabled?: boolean
}

export function TextAreaField({ id, label, value, onChange, rows = 3, maxLength, error, disabled }: Props) {
  const errorId = `${id}-error`
  const countId = `${id}-count`

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={[maxLength && countId, error && errorId].filter(Boolean).join(' ') || undefined}
        className="rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      {maxLength && (
        <span id={countId} className="self-end text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </span>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
