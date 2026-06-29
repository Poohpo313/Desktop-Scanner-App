import type { PaginationInput, PaginatedResult } from "./pagination";
import {
  appendPaginationClause,
  parsePagination,
  wantsPagination,
  wrapPaginatedResult,
} from "./pagination";

type QueryRunner = {
  query: (sql: string, params?: unknown[]) => Promise<unknown>;
};

export async function queryScopedList<T>(
  repo: QueryRunner,
  options: {
    baseSql: string;
    params: unknown[];
    orderSql: string;
    pagination?: PaginationInput;
    beforeQuery?: () => Promise<void>;
  },
): Promise<T[] | PaginatedResult<T>> {
  if (options.beforeQuery) {
    await options.beforeQuery();
  }

  if (!wantsPagination(options.pagination)) {
    return repo.query(`${options.baseSql} ${options.orderSql}`, options.params) as Promise<T[]>;
  }

  const { page, limit, offset } = parsePagination(options.pagination);
  const countRows = (await repo.query(
    `SELECT COUNT(*)::int AS total FROM (${options.baseSql}) scoped`,
    [...options.params],
  )) as Array<{ total: number }>;
  const total = countRows[0]?.total ?? 0;
  const pageParams = [...options.params];
  const items = (await repo.query(
    appendPaginationClause(`${options.baseSql} ${options.orderSql}`, pageParams, offset, limit),
    pageParams,
  )) as T[];

  return wrapPaginatedResult(items, total, page, limit);
}
