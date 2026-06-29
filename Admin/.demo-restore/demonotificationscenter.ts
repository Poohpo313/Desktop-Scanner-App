export type NotificationCenterCategory =
  | "user-registrations"
  | "license-assignments"
  | "revocation-requests"
  | "approvals";

export type NotificationCenterFilter = "all" | NotificationCenterCategory;

export type NotificationCenterStatus =
  | "new"
  | "completed"
  | "pending-approval"
  | "approved";

export type NotificationCenterIconTone = "green-user" | "blue-check" | "red-shield" | "green-check" | "blue-key";

export type NotificationCenterRow = {
  id: string;
  title: string;
  subtitle: string;
  category: NotificationCenterCategory;
  status: NotificationCenterStatus;
  statusLabel: string;
  timeline: string;
  iconTone: NotificationCenterIconTone;
  urgent?: boolean;
};

export const NOTIFICATIONS_CENTER_TOTAL = 124;
export const NOTIFICATIONS_CENTER_PAGE_SIZE = 10;

export const NOTIFICATION_CENTER_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "user-registrations", label: "User Registrations" },
  { value: "license-assignments", label: "License Assignments" },
  { value: "revocation-requests", label: "Revocation Requests" },
  { value: "approvals", label: "Approvals" },
] as const;

const MOCKUP_ROWS: NotificationCenterRow[] = [
  {
    id: "n-center-1",
    title: "5 New User Registrations",
    subtitle: "Awaiting role assignments.",
    category: "user-registrations",
    status: "new",
    statusLabel: "NEW",
    timeline: "5 mins ago",
    iconTone: "green-user",
  },
  {
    id: "n-center-2",
    title: "3 License Assignment Requests Completed",
    subtitle: "Sent to user emails.",
    category: "license-assignments",
    status: "completed",
    statusLabel: "COMPLETED",
    timeline: "15 mins ago",
    iconTone: "blue-check",
  },
  {
    id: "n-center-3",
    title: "2 Revocation Requests Awaiting Approval",
    subtitle: "Urgent review required.",
    category: "revocation-requests",
    status: "pending-approval",
    statusLabel: "PENDING APPROVAL",
    timeline: "25 mins ago",
    iconTone: "red-shield",
    urgent: true,
  },
  {
    id: "n-center-4",
    title: "2 Revocation Requests Approved",
    subtitle: "Approved by Super Administrator.",
    category: "approvals",
    status: "approved",
    statusLabel: "APPROVED",
    timeline: "1 hour ago",
    iconTone: "green-check",
  },
  {
    id: "n-center-5",
    title: "4 New License Keys Generated",
    subtitle: "Added to available key inventory.",
    category: "license-assignments",
    status: "completed",
    statusLabel: "COMPLETED",
    timeline: "2 hours ago",
    iconTone: "blue-key",
  },
];

const GENERATED_TITLES: Array<Pick<NotificationCenterRow, "title" | "subtitle" | "category" | "status" | "statusLabel" | "iconTone">> = [
  {
    title: "User Registration Pending Review",
    subtitle: "Awaiting role assignments.",
    category: "user-registrations",
    status: "new",
    statusLabel: "NEW",
    iconTone: "green-user",
  },
  {
    title: "License Assignment Completed",
    subtitle: "Sent to user emails.",
    category: "license-assignments",
    status: "completed",
    statusLabel: "COMPLETED",
    iconTone: "blue-check",
  },
  {
    title: "Revocation Request Submitted",
    subtitle: "Urgent review required.",
    category: "revocation-requests",
    status: "pending-approval",
    statusLabel: "PENDING APPROVAL",
    iconTone: "red-shield",
  },
  {
    title: "Revocation Request Approved",
    subtitle: "Approved by Super Administrator.",
    category: "approvals",
    status: "approved",
    statusLabel: "APPROVED",
    iconTone: "green-check",
  },
  {
    title: "License Keys Generated",
    subtitle: "Added to available key inventory.",
    category: "license-assignments",
    status: "completed",
    statusLabel: "COMPLETED",
    iconTone: "blue-key",
  },
];

function formatTimeline(index: number) {
  if (index < 5) return MOCKUP_ROWS[index].timeline;
  const hours = 3 + Math.floor(index / 8);
  if (hours < 24) return `${hours} hours ago`;
  return `${1 + Math.floor(index / 24)} days ago`;
}

function buildGeneratedRow(index: number): NotificationCenterRow {
  const template = GENERATED_TITLES[index % GENERATED_TITLES.length];
  return {
    id: `n-center-${index + 1}`,
    title: template.title,
    subtitle: template.subtitle,
    category: template.category,
    status: template.status,
    statusLabel: template.statusLabel,
    timeline: formatTimeline(index),
    iconTone: template.iconTone,
    urgent: template.status === "pending-approval" && index % 7 === 0,
  };
}

let catalogCache: NotificationCenterRow[] | null = null;

export function getNotificationsCenterCatalog(): NotificationCenterRow[] {
  if (!catalogCache) {
    catalogCache = [
      ...MOCKUP_ROWS,
      ...Array.from({ length: NOTIFICATIONS_CENTER_TOTAL - MOCKUP_ROWS.length }, (_, index) =>
        buildGeneratedRow(index + MOCKUP_ROWS.length)
      ),
    ];
  }
  return catalogCache;
}

export function filterNotificationsCenter(
  rows: NotificationCenterRow[],
  query: string,
  category: NotificationCenterFilter
): NotificationCenterRow[] {
  const normalized = query.trim().toLowerCase();

  return rows.filter((row) => {
    if (category !== "all" && row.category !== category) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return (
      row.title.toLowerCase().includes(normalized) ||
      row.subtitle.toLowerCase().includes(normalized) ||
      row.statusLabel.toLowerCase().includes(normalized)
    );
  });
}
