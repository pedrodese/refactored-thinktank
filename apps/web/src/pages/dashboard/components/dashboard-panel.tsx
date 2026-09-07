import type { ReactNode } from 'react'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  title: string
  count: number
  emptyMessage: string
  action?: ReactNode
  children: ReactNode
}

/**
 * The card around one dashboard table, with the count in its heading and the
 * empty state that replaces the table. Wide tables scroll inside it rather than
 * making the page scroll sideways.
 */
export function DashboardPanel({ title, count, emptyMessage, action, children }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">
            {title}: {count}
          </h2>
          {action}
        </div>
        {count === 0 ? (
          <EmptyState title="Nenhum registro encontrado" message={emptyMessage} />
        ) : (
          <div className="overflow-x-auto">{children}</div>
        )}
      </CardContent>
    </Card>
  )
}
