import type { ActivityLogApiRow } from "../api/activityLogs.api";
import type { DashboardActivityRow } from "../data/demoDashboard";
import type { KeyActivityItem } from "../data/demoKeys";

function formatActivityTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function displayName(row: ActivityLogApiRow): string {
  const fullName = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
  return fullName || row.username || "System";
}

function actionLabel(action: string): string {
  return action
    .replace(/\./g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mapActivityLogsToDashboardRows(
  rows: ActivityLogApiRow[],
  limit = 5,
): DashboardActivityRow[] {
  return rows.slice(0, limit).map((row) => ({
    id: String(row.id),
    name: displayName(row),
    email: row.email ?? "",
    avatar: "",
    action: actionLabel(row.action),
    status: "success",
    timestamp: formatActivityTime(row.timestamp),
  }));
}

const KEY_ACTION_PREFIXES = ["keys.", "key.", "device.registered"];

function isKeyRelatedAction(action: string): boolean {
  const normalized = action.toLowerCase();
  return KEY_ACTION_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function keyActivityType(action: string): KeyActivityItem["type"] {
  const normalized = action.toLowerCase();
  if (normalized.includes("generate")) return "generated";
  if (normalized.includes("assign")) return "assigned";
  if (normalized.includes("revoke") || normalized.includes("deactivate")) return "revoked";
  return "audit";
}

export function mapActivityLogsToKeyActivity(
  rows: ActivityLogApiRow[],
  limit = 5,
): KeyActivityItem[] {
  return rows
    .filter((row) => isKeyRelatedAction(row.action))
    .slice(0, limit)
    .map((row) => ({
      id: String(row.id),
      label: actionLabel(row.action),
      time: formatActivityTime(row.timestamp),
      type: keyActivityType(row.action),
    }));
}
