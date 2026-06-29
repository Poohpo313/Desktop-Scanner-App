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

export const ACTIVITY_LOGS_VIEW_TOTAL = 1250;
export const ACTIVITY_LOGS_PAGE_SIZE = 5;

const MOCKUP_ROWS: ActivityLogViewRow[] = [
  {
    id: "log-1",
    name: "John Dela Cruz",
    email: "jdelacruz@unilabs.io",
    avatarKind: "initials",
    initials: "JD",
    actionTitle: "Approved User Registration",
    actionDetail: "Request ID: REG-1021",
    status: "success",
    timestamp: "May 28, 2026 - 09:15 AM",
    logDate: "2026-05-28",
  },
  {
    id: "log-2",
    name: "Maria Leonora",
    email: "mleonora@unilabs.io",
    avatarKind: "photo",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    actionTitle: "Register Scanner Device",
    actionDetail: "Scanner ID: SCN-102",
    status: "success",
    timestamp: "May 28, 2026 - 08:45 AM",
    logDate: "2026-05-28",
  },
  {
    id: "log-3",
    name: "Robert Lim",
    email: "rlim@unilabs.io",
    avatarKind: "initials",
    initials: "RL",
    actionTitle: "Submitted Support Request",
    actionDetail: "Ticket: Critical Hardware Sync Error",
    status: "pending",
    timestamp: "May 27, 2026 - 04:20 PM",
    logDate: "2026-05-27",
  },
  {
    id: "log-4",
    name: "Alex Rivera",
    email: "arivera@unilabs.io",
    avatarKind: "photo",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    actionTitle: "Device Connection Failed",
    actionDetail: "Scanner ID: SCN-115",
    status: "failed",
    timestamp: "May 26, 2026 - 11:10 AM",
    logDate: "2026-05-26",
  },
  {
    id: "log-5",
    name: "Thomas Park",
    email: "tpark@unilabs.io",
    avatarKind: "generic",
    actionTitle: "Completed Device Synchronization",
    actionDetail: "Scanner ID: SCN-115",
    status: "success",
    timestamp: "May 26, 2026 - 2:30 PM",
    logDate: "2026-05-26",
  },
];

const GENERATED_TEMPLATES = [
  {
    name: "Sarah Chen",
    email: "schen@unilabs.io",
    actionTitle: "Approved User Registration",
    actionDetail: "Request ID: REG-{n}",
    status: "success" as const,
  },
  {
    name: "David Kim",
    email: "dkim@unilabs.io",
    actionTitle: "Register Scanner Device",
    actionDetail: "Scanner ID: SCN-{n}",
    status: "success" as const,
  },
  {
    name: "Emily Watson",
    email: "ewatson@unilabs.io",
    actionTitle: "Submitted Support Request",
    actionDetail: "Ticket: Hardware Sync Error #{n}",
    status: "pending" as const,
  },
  {
    name: "Michael Torres",
    email: "mtorres@unilabs.io",
    actionTitle: "Device Connection Failed",
    actionDetail: "Scanner ID: SCN-{n}",
    status: "failed" as const,
  },
  {
    name: "Lisa Nguyen",
    email: "lnguyen@unilabs.io",
    actionTitle: "Completed Device Synchronization",
    actionDetail: "Scanner ID: SCN-{n}",
    status: "success" as const,
  },
];

const PHOTO_AVATARS = [
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
];

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatGeneratedTimestamp(index: number) {
  const day = 26 - Math.floor(index / 40);
  const hour = 8 + (index % 10);
  const minute = (index * 7) % 60;
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const month = day >= 27 ? "May" : "May";
  const displayDay = Math.max(20, Math.min(28, day));
  return `${month} ${displayDay}, 2026 - ${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

function buildGeneratedRow(index: number): ActivityLogViewRow {
  const template = GENERATED_TEMPLATES[index % GENERATED_TEMPLATES.length];
  const avatarKind: ActivityLogAvatarKind =
    index % 5 === 0 ? "generic" : index % 3 === 0 ? "photo" : "initials";

  return {
    id: `log-${index + 1}`,
    name: template.name,
    email: template.email,
    avatarKind,
    avatar: avatarKind === "photo" ? PHOTO_AVATARS[index % PHOTO_AVATARS.length] : undefined,
    initials: avatarKind === "initials" ? initialsFor(template.name) : undefined,
    actionTitle: template.actionTitle,
    actionDetail: template.actionDetail.replace("{n}", String(1000 + index)),
    status: template.status,
    timestamp: formatGeneratedTimestamp(index),
    logDate: `2026-05-${String(20 + (index % 9)).padStart(2, "0")}`,
  };
}

let catalogCache: ActivityLogViewRow[] | null = null;

export function getActivityLogsViewCatalog(): ActivityLogViewRow[] {
  if (!catalogCache) {
    catalogCache = [
      ...MOCKUP_ROWS,
      ...Array.from({ length: ACTIVITY_LOGS_VIEW_TOTAL - MOCKUP_ROWS.length }, (_, index) =>
        buildGeneratedRow(index + MOCKUP_ROWS.length)
      ),
    ];
  }
  return catalogCache;
}

export function filterActivityLogsView(
  rows: ActivityLogViewRow[],
  query: string,
  status: ActivityLogStatusFilter,
  date: string
): ActivityLogViewRow[] {
  const normalized = query.trim().toLowerCase();

  return rows.filter((row) => {
    if (status !== "all" && row.status !== status) {
      return false;
    }

    if (date && row.logDate !== date) {
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

export function exportActivityLogsViewCsv(rows: ActivityLogViewRow[]): void {
  const header = "User,Email,Action,Details,Status,Timestamp";
  const lines = rows.map(
    (row) =>
      `"${row.name}","${row.email}","${row.actionTitle.replace(/"/g, '""')}","${row.actionDetail.replace(/"/g, '""')}","${row.status}","${row.timestamp}"`
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "activity-logs.csv";
  anchor.click();
  URL.revokeObjectURL(url);
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
