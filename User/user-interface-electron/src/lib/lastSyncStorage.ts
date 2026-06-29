import { APP_STORAGE_KEYS } from "../config/appStorage";

export const LAST_SYNC_UPDATED_EVENT = "bukolabs-last-sync-updated";

function storageKey(userId: number) {
  return `${APP_STORAGE_KEYS.lastSync}-${userId}`;
}

export function loadLastSyncAt(userId: number | null): Date | null {
  if (userId == null) return null;

  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export function recordSyncNow(userId: number) {
  const now = new Date();
  localStorage.setItem(storageKey(userId), now.toISOString());
  window.dispatchEvent(
    new CustomEvent(LAST_SYNC_UPDATED_EVENT, { detail: { userId, at: now.toISOString() } }),
  );
}

export function formatLastSyncDate(date: Date): string {
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${datePart} ${timePart}`;
}

export function getLastSyncLabel(userId: number | null, isOnline: boolean): string {
  if (!isOnline) return "Offline";

  const lastSync = loadLastSyncAt(userId);
  if (!lastSync) return "Not synced yet";

  return formatLastSyncDate(lastSync);
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function maybeRecordDailySync(
  userId: number | null,
  cloudSync: boolean,
  isOnline: boolean,
) {
  if (userId == null || !cloudSync || !isOnline) return;

  const lastSync = loadLastSyncAt(userId);
  const now = new Date();

  if (!lastSync || !isSameCalendarDay(lastSync, now)) {
    recordSyncNow(userId);
  }
}
