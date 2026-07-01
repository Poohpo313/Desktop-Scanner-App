import { useEffect, useState } from "react";
import type { Device } from "../types";

export const DEVICE_ONLINE_TIMEOUT_MS = 3 * 60 * 1000;

export function isDeviceOnline(device: Pick<Device, "status" | "lastSeen">) {
  if (device.status !== "active") return false;
  if (!device.lastSeen) return false;
  return Date.now() - new Date(device.lastSeen).getTime() < DEVICE_ONLINE_TIMEOUT_MS;
}

export function formatDeviceOnlineStatus(device: Pick<Device, "status" | "lastSeen">) {
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
