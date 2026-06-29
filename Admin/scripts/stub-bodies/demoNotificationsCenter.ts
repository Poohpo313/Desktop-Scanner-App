export type NotificationCenterCategory =
  | "user-registrations"
  | "serial-assignments"
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

export const NOTIFICATIONS_CENTER_TOTAL = 0;
export const NOTIFICATIONS_CENTER_PAGE_SIZE = 10;

export const NOTIFICATION_CENTER_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "user-registrations", label: "User Registrations" },
  { value: "serial-assignments", label: "Serial Assignments" },
  { value: "revocation-requests", label: "Revocation Requests" },
  { value: "approvals", label: "Approvals" },
] as const;

export function getNotificationsCenterCatalog(): NotificationCenterRow[] {
  return [];
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

export function getNotificationCenterReadCounts(rows: NotificationCenterRow[]) {
  let unread = 0;
  let read = 0;

  for (const row of rows) {
    if (row.status === "new" || row.status === "pending-approval") {
      unread += 1;
    } else {
      read += 1;
    }
  }

  return { unread, read };
}