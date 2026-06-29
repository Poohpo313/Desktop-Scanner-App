import type { Device } from "../types";

export const DEVICE_ONLINE_TIMEOUT_MS = 3 * 60 * 1000;

export function isDeviceOnline(device: Pick<Device, "status" | "lastSeen" | "isOnline">) {
  if (typeof device.isOnline === "boolean") return device.isOnline;
  if (device.status !== "active") return false;
  if (!device.lastSeen) return false;
  return Date.now() - new Date(device.lastSeen).getTime() < DEVICE_ONLINE_TIMEOUT_MS;
}

export function formatDeviceOnlineStatus(device: Pick<Device, "status" | "lastSeen" | "isOnline">) {
  return isDeviceOnline(device) ? "Online" : "Offline";
}

export function formatAccountRegistrationStatus(accountStatus?: string | null) {
  return accountStatus === "active" ? "Activated" : "Inactive";
}
