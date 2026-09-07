import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Records edited inside their parent's form and saved with it.
 *
 * Removal is the part worth sharing rather than the chrome: a row that exists
 * on the server is kept in the payload and flagged for destruction, while one
 * that was only ever typed is dropped. Getting that backwards loses a record
 * or leaves an orphan, and neither says anything at the time.
 */
interface NestedRow {
  id: number | null
  _destroy?: boolean
}

interface Props<T extends NestedRow> {
  title: string
  description: string
  addLabel: string
  rowLabel: (position: number) => string
  removeLabel: string
  emptyMessage: string
  rows: readonly T[]
  blankRow: T
  onChange: (rows: T[]) => void
  renderRow: (row: T, index: number, update: (changes: Partial<T>) => void) => ReactNode
}

export function NestedRows<T extends NestedRow>({
  title,
  description,
  addLabel,
  rowLabel,
  removeLabel,
  emptyMessage,
  rows,
  blankRow,
  onChange,
  renderRow,
}: Props<T>) {
  const visible = rows.map((row, index) => ({ row, index })).filter(({ row }) => !row._destroy)
  const update = (index: number, changes: Partial<T>) =>
    onChange(rows.map((row, position) => (position === index ? { ...row, ...changes } : row)))
  const remove = (index: number) =>
    onChange(
      rows.flatMap((row, position) => {
        if (position !== index) return [row]
        return row.id === null ? [] : [{ ...row, _destroy: true }]
      })
    )

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { ...blankRow }])}>
          {addLabel}
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map(({ row, index }, position) => (
            <li key={row.id ?? `new-${index}`} className="flex flex-col gap-4 rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{rowLabel(position + 1)}</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  {removeLabel}
                </Button>
              </div>
              {renderRow(row, index, (changes) => update(index, changes))}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
