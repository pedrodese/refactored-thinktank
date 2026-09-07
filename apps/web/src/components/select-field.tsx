import { SelectInput } from '@/components/select-input'
import { Label } from '@/components/ui/label'
import type { Labeled } from '@/types/labeled'

/**
 * A labelled single select with its server-side error. Options carry the label
 * the server rendered for each value, so no value-to-label map lives here.
 */
interface Props {
  id: string
  label: string
  options: readonly Labeled<string>[]
  value: string
  onChange: (value: string) => void
  blankLabel?: string
  error?: string
}

export function SelectField({ id, label, options, value, onChange, blankLabel, error }: Props) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <SelectInput
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      >
        {blankLabel && <option value="">{blankLabel}</option>}
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
