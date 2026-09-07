import { Button } from '@/components/ui/button'
import type { Pagination } from '@/types/pagination'

interface Props {
  pagination: Pagination
  onPageChange: (page: number) => void
}

// Simplificado em relação à versão Rails/kaminari: sem a janela de números de
// página pré-calculada pelo servidor (a API nova não manda isso em `meta`,
// só page/per/total/totalPages) — Anterior/Próxima + "página X de Y" cobre a
// necessidade sem o front ter que reimplementar aquela aritmética.
export function PaginationNav({ pagination, onPageChange }: Props) {
  if (pagination.totalPages <= 1) return null

  const { page, totalPages } = pagination

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Próxima
      </Button>
    </nav>
  )
}
