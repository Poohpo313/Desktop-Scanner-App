export type PaginatedList<T> = {
  items: T[];
  meta?: unknown;
};

export function unwrapList<T>(data: T[] | PaginatedList<T> | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.items)) {
    return data.items;
  }
  return [];
}
