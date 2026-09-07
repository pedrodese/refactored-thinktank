import { SelectInput } from '@/components/select-input'
import { Label } from '@/components/ui/label'
import type { Labeled } from '@/types/labeled'

/**
 * How a many-to-many association is edited: the native multiple select, with
 * the hint that says how to select more than one, and the server's error. The
 * values are the ids the form posts, as strings, which is what a select control
 * carries either way.
 */
interface Props {
  id: string
  label: string
  options: readonly Labeled<string>[]
  value: readonly string[]
  onChange: (value: string[]) => void
  error?: string
  rows?: number
}

export function MultiSelectField({ id, label, options, value, onChange, error, rows = 10 }: Props) {
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <p id={descriptionId} className="text-xs text-muted-foreground">
        Selecione várias mantendo Ctrl (ou Command) pressionado.
      </p>
      <SelectInput
        id={id}
        multiple
        size={rows}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={[descriptionId, error && errorId].filter(Boolean).join(' ')}
        onChange={(event) => onChange(Array.from(event.target.selectedOptions, (option) => option.value))}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectInput>
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
