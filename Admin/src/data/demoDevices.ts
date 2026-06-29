export const DEVICE_CATALOG_TOTAL = 0;
export const DEVICE_CATALOG_PAGE_COUNT = 0;

export const DEVICE_CATALOG_STATS = {
  connected: 0,
  active: 0,
  inactive: 0,
  unauthorized: 0,
};

export const FIGMA_DEVICE_TOTAL = DEVICE_CATALOG_TOTAL;
export const FIGMA_DEVICE_PAGE_COUNT = DEVICE_CATALOG_PAGE_COUNT;

export const FIGMA_DEVICE_STATS = DEVICE_CATALOG_STATS;

export type DeviceInternetStatus = "connected" | "disconnected" | "blocked";
export type DeviceDisplayStatus = "active" | "inactive" | "unauthorized";
export type DeviceTypeVariant = "peripheral" | "output";

export type DemoDeviceRow = {
  id: string;
  name: string;
  type: string;
  typeVariant: DeviceTypeVariant;
  user: string;
  status: DeviceDisplayStatus;
  internet: DeviceInternetStatus;
};

export const DEMO_DEVICE_LIST: DemoDeviceRow[] = [];

export function getFigmaDeviceListRow(_index: number): DemoDeviceRow {
  return {
    id: "",
    name: "",
    type: "",
    typeVariant: "peripheral",
    user: "",
    status: "inactive",
    internet: "disconnected",
  };
}

export function displayDeviceStatus(status: string): string {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  if (status === "unauthorized") return "Unauthorized";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function deviceStatusPillClass(status: string): string {
  if (status === "active") return "active";
  if (status === "inactive") return "inactive";
  return "unauthorized";
}

export function mapApiDeviceStatus(status: string): DeviceDisplayStatus {
  if (status === "active") return "active";
  if (status === "inactive") return "inactive";
  if (status === "unauthorized") return "unauthorized";
  return "inactive";
}

export function mapApiDeviceInternet(status: DeviceDisplayStatus): DeviceInternetStatus {
  if (status === "unauthorized") return "blocked";
  if (status === "inactive") return "disconnected";
  return "connected";
}

export function getDeviceNetworkIdentity(deviceId: string, _deviceName?: string): string {
  const suffix = deviceId.replace(/[^A-Za-z0-9]/g, "").slice(-4).toUpperCase().padStart(4, "0");
  return `KS-SEC-${suffix}`;
}
