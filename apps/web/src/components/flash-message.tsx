import type { ReactNode } from 'react'

/**
 * The server's one-line answer to what just happened. Shared by both layouts
 * rather than duplicated: the two are the only consumers, but a second copy of
 * the role, the tone map and the tokens is a second thing to keep correct.
 */
interface Props {
  tone: 'notice' | 'alert'
  children: ReactNode
}

export function FlashMessage({ tone, children }: Props) {
  const classes =
    tone === 'notice'
      ? 'bg-status-complete text-status-complete-foreground'
      : 'bg-status-destructive text-status-destructive-foreground'

  return (
    <div role="alert" className={`rounded-md px-4 py-3 text-sm ${classes}`}>
      {children}
    </div>
  )
}
