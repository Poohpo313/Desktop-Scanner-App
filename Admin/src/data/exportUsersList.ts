import type { AdminUser } from "../types";
import { downloadCsvInBrowser } from "../utils/downloadCsv";

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportUsersListCsv(users: AdminUser[]): void {
  const header = "Username,Full Name,Email,Phone Number,Assigned Key,Status,Registered";
  const rows = users.map((user) => {
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username;
    const status = user.accountStatus === "active" ? "Active" : "Inactive";
    const registered = user.createdAt ? new Date(user.createdAt).toLocaleString() : "";

    return [
      escapeCsv(user.username),
      escapeCsv(fullName),
      escapeCsv(user.email ?? ""),
      escapeCsv(user.phoneNumber ?? ""),
      escapeCsv(user.serialKey ?? "—"),
      escapeCsv(status),
      escapeCsv(registered),
    ].join(",");
  });

  downloadCsvInBrowser([header, ...rows].join("\n"), "users-list.csv", "text/csv");
}
