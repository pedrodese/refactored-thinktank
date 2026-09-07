/** Shape de `meta` na resposta paginada da API nova (`{data, meta}`). */
export interface Pagination {
  readonly page: number
  readonly per: number
  readonly total: number
  readonly totalPages: number
}

export interface PaginatedResult<T> {
  readonly data: readonly T[]
  readonly meta: Pagination
}
