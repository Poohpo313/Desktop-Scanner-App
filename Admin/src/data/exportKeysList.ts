import type { SerialKey } from "../types";
import { displayKeyStatus } from "./demoKeys";
import { formatDatedExportFilename } from "../utils/exportFormat";
import { saveTextFile } from "../utils/saveFile";

export type KeyExportFieldId = "keyId" | "licenseKey" | "assignedUser" | "status" | "dateGenerated";

export type KeyExportFieldSelection = Record<KeyExportFieldId, boolean>;

export type KeyExportOptions = {
  startDate?: string;
  endDate?: string;
  fields: KeyExportFieldSelection;
};

export type KeyExportRow = {
  id: string | number;
  key: string;
  user: string;
  status: string;
  date: string;
};

export const KEY_EXPORT_FIELD_LABELS: Record<KeyExportFieldId, string> = {
  keyId: "Key ID",
  licenseKey: "Serial Key",
  assignedUser: "Assigned User",
  status: "Status",
  dateGenerated: "Date Generated",
};

export const DEFAULT_KEY_EXPORT_FIELDS: KeyExportFieldSelection = {
  keyId: true,
  licenseKey: true,
  assignedUser: true,
  status: true,
  dateGenerated: false,
};

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

function rowExportDate(row: KeyExportRow): Date | null {
  return parseExportDate(row.date);
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
    const rowDate = rowExportDate(row);
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

export async function exportKeysListCsv(rows: KeyExportRow[], options?: KeyExportOptions): Promise<void> {
  const fields = { ...DEFAULT_KEY_EXPORT_FIELDS, ...options?.fields };
  const activeFields = (Object.keys(fields) as KeyExportFieldId[]).filter((field) => fields[field]);
  if (activeFields.length === 0) return;

  const header = activeFields.map((field) => KEY_EXPORT_FIELD_LABELS[field]).join(",");
  const csvRows = rows.map((row) =>
    activeFields
      .map((field) => {
        switch (field) {
          case "keyId":
            return escapeCsv(String(row.id));
          case "licenseKey":
            return escapeCsv(row.key);
          case "assignedUser":
            return escapeCsv(row.user);
          case "status":
            return escapeCsv(displayKeyStatus(row.status));
          case "dateGenerated":
            return escapeCsv(row.date);
          default:
            return escapeCsv("");
        }
      })
      .join(","),
  );

  const content = [header, ...csvRows].join("\n");
  const filename = formatDatedExportFilename("Keys");
  await saveTextFile(content, filename, "serial-keys");
}

export function serialKeysToExportRows(
  keys: SerialKey[],
  userMap: Map<number, { firstName?: string | null; lastName?: string | null; username: string }>,
): KeyExportRow[] {
  return keys.map((key) => {
    const assignee = key.assignedTo ? userMap.get(key.assignedTo) : undefined;
    const name = assignee
      ? `${assignee.firstName ?? ""} ${assignee.lastName ?? ""}`.trim() || assignee.username
      : "—";

    return {
      id: key.serialId,
      key: key.serialKey,
      user: name,
      status: key.status,
      date: key.generatedAt ? new Date(key.generatedAt).toLocaleDateString() : "—",
    };
  });
}
