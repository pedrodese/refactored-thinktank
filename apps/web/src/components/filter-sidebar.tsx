import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * The card that holds an index screen's filters. Sticky on wide screens so the
 * filters stay reachable while a long table scrolls.
 */
interface Props {
  children: ReactNode
}

export function FilterSidebar({ children }: Props) {
  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:w-72 lg:shrink-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    </aside>
  )
}
