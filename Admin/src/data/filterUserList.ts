type UserListFilterRow = {
  username: string;
  name: string;
  key: string;
  status: "active" | "inactive" | string;
  raw?: {
    email?: string | null;
    phoneNumber?: string | null;
  };
};

export function filterUserListRows<T extends UserListFilterRow>(rows: T[], query: string): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;

  return rows.filter((row) => {
    const statusLabel = row.status === "active" ? "active" : "inactive";

    return (
      row.username.toLowerCase().includes(normalized) ||
      row.name.toLowerCase().includes(normalized) ||
      row.key.toLowerCase().includes(normalized) ||
      statusLabel.includes(normalized) ||
      row.raw?.email?.toLowerCase().includes(normalized) ||
      row.raw?.phoneNumber?.toLowerCase().includes(normalized)
    );
  });
}
