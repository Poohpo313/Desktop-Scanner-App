import { formatDatedExportFilename, formatExportFileSizeLabel } from "../utils/exportFormat";
import { saveTextFile } from "../utils/saveFile";

export type ActivityLogViewStatus = "success" | "pending" | "failed";
export type ActivityLogStatusFilter = "all" | ActivityLogViewStatus;
export type ActivityLogAvatarKind = "initials" | "photo" | "generic";

export type ActivityLogViewRow = {
  id: string;
  name: string;
  email: string;
  avatarKind: ActivityLogAvatarKind;
  avatar?: string;
  initials?: string;
  actionTitle: string;
  actionDetail: string;
  status: ActivityLogViewStatus;
  timestamp: string;
  logDate: string;
};

export const ACTIVITY_LOGS_VIEW_TOTAL = 0;
export const ACTIVITY_LOGS_PAGE_SIZE = 5;

export type ActivityLogsViewExportResult = {
  filename: string;
  fileSizeLabel: string;
  savePath: string;
};

export function getActivityLogsViewCatalog(): ActivityLogViewRow[] {
  return [];
}

export type ActivityLogDateRange = {
  start: string;
  end: string;
};

export const EMPTY_ACTIVITY_LOG_DATE_RANGE: ActivityLogDateRange = {
  start: "",
  end: "",
};

export function filterActivityLogsView(
  rows: ActivityLogViewRow[],
  query: string,
  status: ActivityLogStatusFilter,
  dateRange: ActivityLogDateRange
): ActivityLogViewRow[] {
  const normalized = query.trim().toLowerCase();
  const rangeStart = dateRange.start || dateRange.end;
  const rangeEnd = dateRange.end || dateRange.start;

  return rows.filter((row) => {
    if (status !== "all" && row.status !== status) {
      return false;
    }

    if (rangeStart && (row.logDate < rangeStart || row.logDate > rangeEnd)) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return (
      row.name.toLowerCase().includes(normalized) ||
      row.email.toLowerCase().includes(normalized) ||
      row.actionTitle.toLowerCase().includes(normalized) ||
      row.actionDetail.toLowerCase().includes(normalized)
    );
  });
}

function buildActivityLogsViewCsvContent(rows: ActivityLogViewRow[]): string {
  const header = "User,Email,Action,Details,Status,Timestamp";
  const lines = rows.map(
    (row) =>
      `"${row.name}","${row.email}","${row.actionTitle.replace(/"/g, '""')}","${row.actionDetail.replace(/"/g, '""')}","${row.status}","${row.timestamp}"`
  );

  return [header, ...lines].join("\n");
}

export async function exportActivityLogsViewCsv(
  rows: ActivityLogViewRow[]
): Promise<ActivityLogsViewExportResult> {
  const content = buildActivityLogsViewCsvContent(rows);
  const filename = formatDatedExportFilename("Logs");
  const { directoryPath, sizeBytes } = await saveTextFile(content, filename, "activity-logs");

  return {
    filename,
    fileSizeLabel: formatExportFileSizeLabel(sizeBytes),
    savePath: directoryPath,
  };
}

export function activityLogStatusLabel(status: ActivityLogViewStatus): string {
  return status === "success" ? "Success" : status === "pending" ? "Pending" : "Failed";
}

export const ACTIVITY_LOG_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
] as const;

function formatActivityLogTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { timestamp: iso, logDate: "" };
  }

  const logDate = date.toISOString().slice(0, 10);
  const timestamp = `${date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;

  return { timestamp, logDate };
}

function initialsForName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function parseActivityLogStatus(details: Record<string, unknown> | null | undefined): ActivityLogViewStatus {
  const raw = details?.status;
  if (raw === "pending" || raw === "failed" || raw === "success") {
    return raw;
  }
  return "success";
}

export function areActivityLogRowsEqual(
  current: ActivityLogViewRow[],
  next: ActivityLogViewRow[]
): boolean {
  if (current.length !== next.length) {
    return false;
  }

  return current.every((row, index) => {
    const candidate = next[index];
    return (
      row.id === candidate.id &&
      row.status === candidate.status &&
      row.timestamp === candidate.timestamp &&
      row.actionTitle === candidate.actionTitle &&
      row.actionDetail === candidate.actionDetail
    );
  });
}

export async function fetchActivityLogsView(
  variant: "figma" | "portal" = "portal"
): Promise<ActivityLogViewRow[]> {
  if (variant === "figma") {
    return getActivityLogsViewCatalog();
  }

  const { activityLogsApi } = await import("../api/activityLogs.api");
  const rows = await activityLogsApi.list();

  return rows.map((row) => {
    const fullName = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
    const name = fullName || row.username || "System";
    const email = row.email ?? "";
    const details = row.details ?? null;
    const { timestamp, logDate } = formatActivityLogTimestamp(row.timestamp);

    return {
      id: `log-${row.id}`,
      name,
      email,
      avatarKind: "initials" as const,
      initials: initialsForName(name),
      actionTitle: String(details?.actionTitle ?? row.action),
      actionDetail: String(details?.actionDetail ?? details?.detail ?? ""),
      status: parseActivityLogStatus(details),
      timestamp,
      logDate,
    };
  });
}
