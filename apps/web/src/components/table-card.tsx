import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * A table's surround: the card, and the horizontal scroll container that keeps
 * a wide table from making the page itself scroll sideways.
 */
interface Props {
  children: ReactNode
  footer?: ReactNode
}

export function TableCard({ children, footer }: Props) {
  return (
    <Card className="lg:min-w-0 lg:flex-1">
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto">{children}</div>
        {footer}
      </CardContent>
    </Card>
  )
}
