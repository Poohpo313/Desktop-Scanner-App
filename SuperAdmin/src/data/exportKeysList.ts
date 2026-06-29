import type { AdminUser, SerialKey } from "../types";
import { downloadCsv } from "../utils/downloadCsv";
import { formatDatedExportFilename } from "../utils/exportFormat";

export type KeyExportFieldId =
  | "serialId"
  | "serialKey"
  | "assignedUser"
  | "company"
  | "department"
  | "status"
  | "generatedAt"
  | "expiresAt";

export type KeyExportFieldSelection = Record<KeyExportFieldId, boolean>;

export type KeyExportOptions = {
  startDate?: string;
  endDate?: string;
  fields: KeyExportFieldSelection;
};

export type KeyExportRow = {
  serialId: number;
  serialKey: string;
  user: string;
  company: string;
  department: string;
  status: string;
  generatedAt: string;
  expiresAt: string;
};

export type KeyExportResult = {
  filename: string;
  sizeBytes: number;
  savePath: string;
};

export const KEY_EXPORT_FIELD_LABELS: Record<KeyExportFieldId, string> = {
  serialId: "Key ID",
  serialKey: "Serial Key",
  assignedUser: "Assigned User",
  company: "Company",
  department: "Department",
  status: "Status",
  generatedAt: "Date Generated",
  expiresAt: "Expiration Date",
};

export const DEFAULT_KEY_EXPORT_FIELDS: KeyExportFieldSelection = {
  serialId: true,
  serialKey: true,
  assignedUser: true,
  company: true,
  department: true,
  status: true,
  generatedAt: true,
  expiresAt: false,
};

const EXPORT_FOLDER = "Downloads\\Bukolabs\\Serial Keys";

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function parseExportDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const slashParts = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashParts) {
    const [, month, day, year] = slashParts;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function filterKeyExportRowsByDateRange(
  rows: KeyExportRow[],
  startDate?: string,
  endDate?: string,
): KeyExportRow[] {
  const start = startDate?.trim() ? parseExportDate(startDate) : null;
  const end = endDate?.trim() ? parseExportDate(endDate) : null;
  if (!start && !end) return rows;

  return rows.filter((row) => {
    const rowDate = parseExportDate(row.generatedAt);
    if (!rowDate) return !start && !end;

    const normalizedRowDate = new Date(rowDate);
    normalizedRowDate.setHours(0, 0, 0, 0);

    if (start) {
      const normalizedStart = new Date(start);
      normalizedStart.setHours(0, 0, 0, 0);
      if (normalizedRowDate < normalizedStart) return false;
    }

    if (end) {
      const normalizedEnd = new Date(end);
      normalizedEnd.setHours(23, 59, 59, 999);
      if (normalizedRowDate > normalizedEnd) return false;
    }

    return true;
  });
}

export function serialKeysToExportRows(keys: SerialKey[], users: AdminUser[]): KeyExportRow[] {
  return keys.map((key) => {
    const assignee = users.find((user) => user.userId === key.assignedTo);
    const name = assignee
      ? [assignee.firstName, assignee.lastName].filter(Boolean).join(" ").trim() || assignee.username
      : "-";

    return {
      serialId: key.serialId,
      serialKey: key.serialKey,
      user: name,
      company: key.company ?? "-",
      department: key.department ?? "-",
      status: key.status,
      generatedAt: key.generatedAt
        ? new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(
            new Date(key.generatedAt),
          )
        : "-",
      expiresAt: key.expiresAt
        ? new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(
            new Date(key.expiresAt),
          )
        : "Never",
    };
  });
}

export function exportKeysListCsv(rows: KeyExportRow[], options?: KeyExportOptions): KeyExportResult {
  const fields = { ...DEFAULT_KEY_EXPORT_FIELDS, ...options?.fields };
  const activeFields = (Object.keys(fields) as KeyExportFieldId[]).filter((field) => fields[field]);
  if (activeFields.length === 0) {
    throw new Error("Select at least one export field");
  }

  const filteredRows = filterKeyExportRowsByDateRange(rows, options?.startDate, options?.endDate);
  const header = activeFields.map((field) => KEY_EXPORT_FIELD_LABELS[field]).join(",");
  const csvRows = filteredRows.map((row) =>
    activeFields
      .map((field) => {
        switch (field) {
          case "serialId":
            return escapeCsv(String(row.serialId));
          case "serialKey":
            return escapeCsv(row.serialKey);
          case "assignedUser":
            return escapeCsv(row.user);
          case "company":
            return escapeCsv(row.company);
          case "department":
            return escapeCsv(row.department);
          case "status":
            return escapeCsv(row.status);
          case "generatedAt":
            return escapeCsv(row.generatedAt);
          case "expiresAt":
            return escapeCsv(row.expiresAt);
          default:
            return escapeCsv("");
        }
      })
      .join(","),
  );

  const content = [header, ...csvRows].join("\n");
  const filename = formatDatedExportFilename("Serial_Keys");
  const sizeBytes = downloadCsv(content, filename);

  return {
    filename,
    sizeBytes,
    savePath: EXPORT_FOLDER,
  };
}
