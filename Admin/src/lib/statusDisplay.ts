import { useEffect, useState } from "react";
import type { Device } from "../types";

export const DEVICE_ONLINE_TIMEOUT_MS = 3 * 60 * 1000;

function parseLastSeenMs(value?: string | null) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function hasRecentHeartbeat(device: Pick<Device, "lastSeen">) {
  const lastSeenMs = parseLastSeenMs(device.lastSeen);
  if (lastSeenMs == null) return false;
  return Date.now() - lastSeenMs < DEVICE_ONLINE_TIMEOUT_MS;
}

export function isDeviceOnline(device: Pick<Device, "status" | "lastSeen" | "isOnline">) {
  if (device.status === "unauthorized") return false;
  if (device.status === "inactive") return false;

  if (typeof device.isOnline === "boolean") {
    return device.isOnline;
  }

  const recent = hasRecentHeartbeat(device);
  if (!recent) return false;
  return device.status === "active";
}

export function formatDeviceOnlineStatus(device: Pick<Device, "status" | "lastSeen" | "isOnline">) {
  return isDeviceOnline(device) ? "Online" : "Offline";
}

/** Re-render on an interval so online/offline labels update between API polls. */
export function useDeviceOnlineClock(intervalMs = 30_000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}

export function formatAccountRegistrationStatus(accountStatus?: string | null) {
  return accountStatus === "active" ? "Activated" : "Inactive";
}
