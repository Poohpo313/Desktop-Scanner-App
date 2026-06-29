export type ActivitySeverity = "normal" | "low" | "critical" | "info" | "warning";

export type PerformerKind = "user" | "system" | "bot" | "manager";

export type ActivityCategory = "user" | "device" | "security" | "system";

export type SystemActivityRecord = {
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

type ActivityTemplate = Pick<
  SystemActivityRecord,
  "activityType" | "description" | "performedBy" | "performerKind" | "severity" | "category"
>;

export const ACTIVITY_LOG_TOTAL_ENTRIES = 15842;

export const ACTIVITY_LOG_SCREEN_STATS: ActivityLogScreenStats = {
  totalActivities: ACTIVITY_LOG_TOTAL_ENTRIES,
  userActions: 4621,
  deviceEvents: 8954,
  securityEvents: 327,
};

const SYSTEM_EVENT_COUNT =
  ACTIVITY_LOG_TOTAL_ENTRIES -
  ACTIVITY_LOG_SCREEN_STATS.userActions -
  ACTIVITY_LOG_SCREEN_STATS.deviceEvents -
  ACTIVITY_LOG_SCREEN_STATS.securityEvents;

/** Target counts per severity (must sum to ACTIVITY_LOG_TOTAL_ENTRIES). */
const SEVERITY_TOTALS: Record<ActivitySeverity, number> = {
  normal: 4498,
  low: 3499,
  critical: 499,
  info: 3999,
  warning: 4347,
};

/** Mockup rows shown first on page 1 */
const MOCKUP_ACTIVITY_ROWS: SystemActivityRecord[] = [
  {
    id: "ACT-15840",
    dateTime: "2023-10-24 14:45:12",
    activityType: "User Registered",
    description: "New admin account created: John Doe",
    performedBy: "John Doe",
    performerKind: "user",
    severity: "normal",
    category: "user",
  },
  {
    id: "ACT-15839",
    dateTime: "2023-10-24 14:32:05",
    activityType: "License Generated",
    description: "Enterprise key issued for WS-007",
    performedBy: "System",
    performerKind: "system",
    severity: "low",
    category: "device",
  },
  {
    id: "ACT-15838",
    dateTime: "2023-10-24 14:15:44",
    activityType: "Device Blocked",
    description: "Unauthorized MAC address detected",
    performedBy: "SecBot-01",
    performerKind: "bot",
    severity: "critical",
    category: "security",
  },
  {
    id: "ACT-15837",
    dateTime: "2023-10-24 13:50:22",
    activityType: "Device Activated",
    description: "Scanner S-441 connected to gateway",
    performedBy: "Fleet Mgr",
    performerKind: "manager",
    severity: "info",
    category: "device",
  },
  {
    id: "ACT-15836",
    dateTime: "2023-10-24 13:02:11",
    activityType: "API Key Rotation",
    description: "Quarterly automatic security rotation",
    performedBy: "System",
    performerKind: "system",
    severity: "warning",
    category: "security",
  },
  {
    id: "ACT-15835",
    dateTime: "2023-10-24 12:48:03",
    activityType: "User Role Updated",
    description: "Regional administrator privileges granted",
    performedBy: "Admin User",
    performerKind: "user",
    severity: "normal",
    category: "user",
  },
  {
    id: "ACT-15834",
    dateTime: "2023-10-24 12:15:19",
    activityType: "License Revoked",
    description: "Key KEY-7721-XX-2026 revoked after decommission",
    performedBy: "System",
    performerKind: "system",
    severity: "warning",
    category: "device",
  },
];

const TEMPLATES_BY_SEVERITY: Record<ActivitySeverity, ActivityTemplate[]> = {
  normal: [
    {
      activityType: "User Registered",
      description: "New admin account created",
      performedBy: "John Doe",
      performerKind: "user",
      severity: "normal",
      category: "user",
    },
    {
      activityType: "User Role Updated",
      description: "Regional administrator privileges granted",
      performedBy: "Admin User",
      performerKind: "user",
      severity: "normal",
      category: "user",
    },
    {
      activityType: "Profile Updated",
      description: "Contact details revised for regional admin",
      performedBy: "John Doe",
      performerKind: "user",
      severity: "normal",
      category: "user",
    },
    {
      activityType: "Health Check",
      description: "Core services heartbeat verified",
      performedBy: "System",
      performerKind: "system",
      severity: "normal",
      category: "system",
    },
  ],
  low: [
    {
      activityType: "License Generated",
      description: "Enterprise key issued for workstation",
      performedBy: "System",
      performerKind: "system",
      severity: "low",
      category: "device",
    },
    {
      activityType: "Sync Completed",
      description: "EU-West region sync finished successfully",
      performedBy: "System",
      performerKind: "system",
      severity: "low",
      category: "device",
    },
    {
      activityType: "System Backup",
      description: "Nightly backup completed successfully",
      performedBy: "System",
      performerKind: "system",
      severity: "low",
      category: "system",
    },
  ],
  critical: [
    {
      activityType: "Device Blocked",
      description: "Unauthorized MAC address detected",
      performedBy: "SecBot-01",
      performerKind: "bot",
      severity: "critical",
      category: "security",
    },
    {
      activityType: "Failed Login",
      description: "Multiple failed attempts detected",
      performedBy: "SecBot-01",
      performerKind: "bot",
      severity: "critical",
      category: "security",
    },
    {
      activityType: "Intrusion Detected",
      description: "Gateway flagged suspicious handshake attempt",
      performedBy: "SecBot-01",
      performerKind: "bot",
      severity: "critical",
      category: "security",
    },
  ],
  info: [
    {
      activityType: "Device Activated",
      description: "Scanner connected to gateway",
      performedBy: "Fleet Mgr",
      performerKind: "manager",
      severity: "info",
      category: "device",
    },
    {
      activityType: "Settings Updated",
      description: "Session timeout policy changed",
      performedBy: "Super Admin",
      performerKind: "user",
      severity: "info",
      category: "user",
    },
    {
      activityType: "Policy Sync",
      description: "Global policy bundle synchronized",
      performedBy: "System",
      performerKind: "system",
      severity: "info",
      category: "system",
    },
  ],
  warning: [
    {
      activityType: "API Key Rotation",
      description: "Automatic security rotation completed",
      performedBy: "System",
      performerKind: "system",
      severity: "warning",
      category: "security",
    },
    {
      activityType: "License Revoked",
      description: "Key revoked after device decommission",
      performedBy: "System",
      performerKind: "system",
      severity: "warning",
      category: "device",
    },
    {
      activityType: "Capacity Threshold",
      description: "License utilization crossed 85% threshold",
      performedBy: "System",
      performerKind: "system",
      severity: "warning",
      category: "system",
    },
  ],
};

function padActivityId(num: number) {
  return `ACT-${num}`;
}

function formatActivityDateTime(base: Date, offsetMinutes: number) {
  const date = new Date(base.getTime() - offsetMinutes * 60_000);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}

function shuffleDeterministic<T>(items: T[]): T[] {
  const sequence = [...items];
  for (let index = sequence.length - 1; index > 0; index -= 1) {
    const swapIndex = (index * 7919 + 104729) % (index + 1);
    const current = sequence[index];
    sequence[index] = sequence[swapIndex];
    sequence[swapIndex] = current;
  }
  return sequence;
}

function countMockupBySeverity() {
  const counts: Record<ActivitySeverity, number> = {
    normal: 0,
    low: 0,
    critical: 0,
    info: 0,
    warning: 0,
  };

  for (const row of MOCKUP_ACTIVITY_ROWS) {
    counts[row.severity] += 1;
  }

  return counts;
}

function countMockupCategories() {
  const counts: Record<ActivityCategory, number> = {
    user: 0,
    device: 0,
    security: 0,
    system: 0,
  };

  for (const row of MOCKUP_ACTIVITY_ROWS) {
    counts[row.category] += 1;
  }

  return counts;
}

function buildSeveritySequence(): ActivitySeverity[] {
  const mockupCounts = countMockupBySeverity();
  const sequence: ActivitySeverity[] = [];

  (Object.keys(SEVERITY_TOTALS) as ActivitySeverity[]).forEach((severity) => {
    const generatedCount = SEVERITY_TOTALS[severity] - mockupCounts[severity];
    for (let index = 0; index < generatedCount; index += 1) {
      sequence.push(severity);
    }
  });

  return shuffleDeterministic(sequence);
}

function buildCategorySequence(): ActivityCategory[] {
  const mockupCounts = countMockupCategories();
  const sequence: ActivityCategory[] = [
    ...Array.from(
      { length: ACTIVITY_LOG_SCREEN_STATS.userActions - mockupCounts.user },
      () => "user" as const
    ),
    ...Array.from(
      { length: ACTIVITY_LOG_SCREEN_STATS.deviceEvents - mockupCounts.device },
      () => "device" as const
    ),
    ...Array.from(
      { length: ACTIVITY_LOG_SCREEN_STATS.securityEvents - mockupCounts.security },
      () => "security" as const
    ),
    ...Array.from(
      { length: SYSTEM_EVENT_COUNT - mockupCounts.system },
      () => "system" as const
    ),
  ];

  return shuffleDeterministic(sequence);
}

const GENERATED_SEVERITY_SEQUENCE = buildSeveritySequence();
const GENERATED_CATEGORY_SEQUENCE = buildCategorySequence();

function pickTemplate(
  severity: ActivitySeverity,
  category: ActivityCategory,
  generatedIndex: number
): ActivityTemplate {
  const severityTemplates = TEMPLATES_BY_SEVERITY[severity];
  const categoryMatches = severityTemplates.filter((template) => template.category === category);
  const pool = categoryMatches.length > 0 ? categoryMatches : severityTemplates;
  return pool[generatedIndex % pool.length];
}

function buildDemoActivityRecord(globalIndex: number): SystemActivityRecord {
  if (globalIndex < MOCKUP_ACTIVITY_ROWS.length) {
    return MOCKUP_ACTIVITY_ROWS[globalIndex];
  }

  const generatedIndex = globalIndex - MOCKUP_ACTIVITY_ROWS.length;
  const actNumber = ACTIVITY_LOG_TOTAL_ENTRIES - globalIndex;
  const severity = GENERATED_SEVERITY_SEQUENCE[generatedIndex];
  const category = GENERATED_CATEGORY_SEQUENCE[generatedIndex];
  const template = pickTemplate(severity, category, generatedIndex);
  const base = new Date("2023-10-24T14:45:12");

  return {
    id: padActivityId(actNumber),
    dateTime: formatActivityDateTime(base, globalIndex * 17),
    activityType: template.activityType,
    description: template.description,
    performedBy: template.performedBy,
    performerKind: template.performerKind,
    severity,
    category: template.category,
  };
}

let allRecordsCache: SystemActivityRecord[] | null = null;

export function getAllDemoActivityRecords(): SystemActivityRecord[] {
  if (!allRecordsCache) {
    allRecordsCache = Array.from({ length: ACTIVITY_LOG_TOTAL_ENTRIES }, (_, index) =>
      buildDemoActivityRecord(index)
    );
  }
  return allRecordsCache;
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

export const CRITICAL_EVENTS_FEED: CriticalEventItem[] = [
  {
    id: "ce-1",
    title: "Unauthorized Attempt",
    detail: "Suspicious login from 192.168.1.94",
    time: "14:22",
    tone: "critical",
  },
  {
    id: "ce-2",
    title: "Failed Login (x3)",
    detail: "Multiple failed attempts for admin_root",
    time: "OCT 24",
    tone: "critical",
  },
  {
    id: "ce-3",
    title: "License Expiry",
    detail: "12 license keys expire in 7 days",
    time: "11:05",
    tone: "warning",
  },
  {
    id: "ce-4",
    title: "System Update",
    detail: "Version 2.4.1 successfully deployed",
    time: "09:00",
    tone: "success",
  },
];

export const OPERATIONAL_STATUS: OperationalStatusItem[] = [
  { label: "Main DB", status: "online" },
  { label: "API Gateway", status: "online" },
  { label: "Security Node", status: "degraded" },
];

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
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "system-activity-records.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
