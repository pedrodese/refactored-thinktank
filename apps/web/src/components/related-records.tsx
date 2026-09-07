import type { ReactNode } from 'react'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { TableCard } from '@/components/table-card'

/**
 * A detail page's list of what points at the record: the heading, how many
 * there are, and either the table or what to do about it being empty. Every
 * show screen has at least one, and a fresh installation sees the empty branch
 * first, which is why the copy for it is required rather than optional.
 */
interface Props {
  title: string
  count: number
  emptyTitle: string
  emptyMessage: string
  children: ReactNode
}

export function RelatedRecords({ title, count, emptyTitle, emptyMessage, children }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <StatusBadge tone="neutral">{count}</StatusBadge>
      </div>
      <TableCard>{count === 0 ? <EmptyState title={emptyTitle} message={emptyMessage} /> : children}</TableCard>
    </section>
  )
}
