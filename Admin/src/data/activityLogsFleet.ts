import { downloadCsvInBrowser } from "../utils/downloadCsv";

export type ActivityLogIcon = "user" | "key" | "device" | "check" | "security" | "settings";

export type ActivityLogEntry = {
  id: string;
  icon: ActivityLogIcon;
  action: string;
  time: string;
  timestamp: string;
  actor: string;
  details: string;
};

export const ACTIVITY_LOGS: ActivityLogEntry[] = [];

export function filterActivityLogs(logs: ActivityLogEntry[], query: string): ActivityLogEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return logs;

  return logs.filter(
    (log) =>
      log.action.toLowerCase().includes(normalized) ||
      log.actor.toLowerCase().includes(normalized) ||
      log.details.toLowerCase().includes(normalized) ||
      log.timestamp.toLowerCase().includes(normalized)
  );
}

export function exportActivityLogsCsv(logs: ActivityLogEntry[]): void {
  const header = "Timestamp,Action,Actor,Details,Relative Time";
  const rows = logs.map(
    (log) =>
      `"${log.timestamp}","${log.action.replace(/"/g, '""')}","${log.actor.replace(/"/g, '""')}","${log.details.replace(/"/g, '""')}","${log.time}"`
  );
  downloadCsvInBrowser([header, ...rows].join("\n"), "activity-logs.csv", "text/csv");
}
