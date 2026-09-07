import type { ReactNode } from 'react'

/**
 * Says what is missing and offers the action that fixes it. An empty list that
 * only says "no records" leaves a fresh installation as a dead end.
 */
interface Props {
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="max-w-prose text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
