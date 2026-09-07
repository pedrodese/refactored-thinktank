export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    per: number;
    total: number;
    totalPages: number;
  };
}

export function paginate<T>(data: T[], total: number, page: number, per: number): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      per,
      total,
      totalPages: Math.max(1, Math.ceil(total / per)),
    },
  };
}
