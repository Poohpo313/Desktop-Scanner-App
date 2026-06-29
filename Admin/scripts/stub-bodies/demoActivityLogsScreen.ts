import { downloadCsvInBrowser } from "../utils/downloadCsv";

export type ActivitySeverity = "normal" | "low" | "critical" | "info" | "warning";

export type PerformerKind = "user" | "system" | "bot" | "manager";

export type ActivityCategory = "user" | "device" | "security" | "system";

export type SystemActivityRecord = {
  recordIndex: number;
  id: string;
  dateTime: string;
  activityType: string;
  description: string;
  performedBy: string;
  performerKind: PerformerKind;
  severity: ActivitySeverity;
  category: ActivityCategory;
};

export type CriticalEventItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "critical" | "warning" | "success";
};

export type OperationalStatusItem = {
  label: string;
  status: "online" | "degraded";
};

export type ActivityLogScreenStats = {
  totalActivities: number;
  userActions: number;
  deviceEvents: number;
  securityEvents: number;
};

export const ACTIVITY_LOG_TOTAL_ENTRIES = 0;

export const ACTIVITY_LOG_SCREEN_STATS: ActivityLogScreenStats = {
  totalActivities: 0,
  userActions: 0,
  deviceEvents: 0,
  securityEvents: 0,
};

export function getAllDemoActivityRecords(): SystemActivityRecord[] {
  return [];
}

export function computeActivityLogStats(records: SystemActivityRecord[]): ActivityLogScreenStats {
  return {
    totalActivities: records.length,
    userActions: records.filter((row) => row.category === "user").length,
    deviceEvents: records.filter((row) => row.category === "device").length,
    securityEvents: records.filter((row) => row.category === "security").length,
  };
}

export function countRecordsBySeverity(
  records: SystemActivityRecord[]
): Record<ActivitySeverity, number> {
  return {
    normal: records.filter((row) => row.severity === "normal").length,
    low: records.filter((row) => row.severity === "low").length,
    critical: records.filter((row) => row.severity === "critical").length,
    info: records.filter((row) => row.severity === "info").length,
    warning: records.filter((row) => row.severity === "warning").length,
  };
}

/** @deprecated use getAllDemoActivityRecords */
export const DEMO_SYSTEM_ACTIVITY_RECORDS = getAllDemoActivityRecords();

export const CRITICAL_EVENTS_FEED: CriticalEventItem[] = [];

export const OPERATIONAL_STATUS: OperationalStatusItem[] = [];

export function severityLabel(severity: ActivitySeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function filterActivityRecords(
  records: SystemActivityRecord[],
  query: string,
  severity: ActivitySeverity | "all"
): SystemActivityRecord[] {
  const normalized = query.trim().toLowerCase();

  return records.filter((row) => {
    if (severity !== "all" && row.severity !== severity) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return (
      row.id.toLowerCase().includes(normalized) ||
      row.activityType.toLowerCase().includes(normalized) ||
      row.description.toLowerCase().includes(normalized) ||
      row.performedBy.toLowerCase().includes(normalized) ||
      row.dateTime.toLowerCase().includes(normalized) ||
      severityLabel(row.severity).toLowerCase().includes(normalized)
    );
  });
}

export function exportSystemActivityCsv(records: SystemActivityRecord[]): void {
  const header = "Activity ID,Date & Time,Activity Type,Description,Performed By,Severity";
  const rows = records.map(
    (row) =>
      `"${row.id}","${row.dateTime}","${row.activityType.replace(/"/g, '""')}","${row.description.replace(/"/g, '""')}","${row.performedBy.replace(/"/g, '""')}","${severityLabel(row.severity)}"`
  );
  downloadCsvInBrowser([header, ...rows].join("\n"), "system-activity-records.csv", "text/csv");
}