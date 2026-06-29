export type PaginationInput = {
  page?: number | string;
  limit?: number | string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export function wantsPagination(input?: PaginationInput): boolean {
  const page = input?.page;
  const limit = input?.limit;
  return (
    (page !== undefined && page !== null && String(page).trim() !== "") ||
    (limit !== undefined && limit !== null && String(limit).trim() !== "")
  );
}

export function parsePagination(input: PaginationInput = {}): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(input.limit) || DEFAULT_LIMIT));
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function appendPaginationClause(sql: string, params: unknown[], offset: number, limit: number): string {
  params.push(limit, offset);
  return `${sql} LIMIT $${params.length - 1} OFFSET $${params.length}`;
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function wrapPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}
