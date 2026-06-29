export type KeyStatusFilter = "all" | "assigned" | "active" | "available" | "revoked";

type FilterRow = {
  id: string | number;
  key: string;
  user: string;
  status: string;
};

export function filterKeysByStatus<T extends FilterRow>(rows: T[], statusFilter: KeyStatusFilter): T[] {
  if (statusFilter === "all") return rows;

  return rows.filter((row) => {
    if (statusFilter === "assigned") return row.status === "assigned" || row.status === "used";
    if (statusFilter === "active") return row.status === "active";
    if (statusFilter === "available") return row.status === "unused";
    if (statusFilter === "revoked") return row.status === "revoked" || row.status === "deactivated";
    return true;
  });
}

export function filterKeysByQuery<T extends FilterRow>(rows: T[], query: string): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;

  return rows.filter(
    (row) =>
      String(row.id).toLowerCase().includes(normalized) ||
      row.key.toLowerCase().includes(normalized) ||
      row.user.toLowerCase().includes(normalized) ||
      row.status.toLowerCase().includes(normalized)
  );
}
