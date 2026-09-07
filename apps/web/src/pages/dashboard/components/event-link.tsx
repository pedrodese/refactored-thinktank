import { Link } from '@inertiajs/react'
import type { DashboardEventRow } from '@/types/dashboard-event-row'

interface Props {
  event: DashboardEventRow
}

export function EventLink({ event }: Props) {
  return (
    <Link href={event.path} className={`underline-offset-4 hover:underline ${event.today ? 'font-semibold' : ''}`}>
      {event.name}
    </Link>
  )
}
