import { devicesApi } from "../api/devices.api";
import { downloadCsvInBrowser } from "../utils/downloadCsv";

export type ViewDeviceStatus = "online" | "offline";

export type ViewDeviceType = "laptop" | "server" | "mobile" | "router";

export type ViewDeviceRow = {
  id: string;
  name: string;
  assetId: string;
  os: string;
  ipAddress: string;
  status: ViewDeviceStatus;
  type: ViewDeviceType;
};

export type DeviceScanResult = {
  devices: ViewDeviceRow[];
  totalCount: number;
  added: number;
  refreshed: boolean;
};

export const VIEW_DEVICES_TOTAL = 0;

export const VIEW_DEVICES_FLEET: ViewDeviceRow[] = [];

const SCAN_OS_OPTIONS = ["—"];

const SCAN_TYPES: ViewDeviceType[] = ["laptop", "server", "mobile", "router"];

function inferDeviceType(deviceType?: string | null): ViewDeviceType {
  const value = (deviceType ?? "").toLowerCase();
  if (value.includes("server")) return "server";
  if (value.includes("mobile") || value.includes("phone") || value.includes("ios") || value.includes("android")) {
    return "mobile";
  }
  if (value.includes("router") || value.includes("edge") || value.includes("network")) return "router";
  return "laptop";
}

function mapApiStatus(status: string): ViewDeviceStatus {
  return status === "active" ? "online" : "offline";
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function scanDeviceFleet(
  currentDevices: ViewDeviceRow[],
  currentTotal: number
): Promise<DeviceScanResult> {
  await wait(900);

  try {
    const apiDevices = await devicesApi.list();
    if (apiDevices.length > 0) {
      const mapped = apiDevices.map((device, index) => ({
        id: String(device.deviceId),
        name: device.deviceName ?? device.serialNumber ?? `DEVICE-${device.deviceId}`,
        assetId: String(device.deviceId).padStart(5, "0"),
        os: device.deviceType ?? SCAN_OS_OPTIONS[index % SCAN_OS_OPTIONS.length],
        ipAddress: "",
        status: mapApiStatus(device.status),
        type: inferDeviceType(device.deviceType),
      }));

      const knownIds = new Set(currentDevices.map((device) => device.id));
      const added = mapped.filter((device) => !knownIds.has(device.id)).length;

      return {
        devices: mapped.slice(0, 6),
        totalCount: Math.max(currentTotal, mapped.length),
        added,
        refreshed: true,
      };
    }
  } catch {
    // Fall back to current fleet below.
  }

  return {
    devices: currentDevices,
    totalCount: currentTotal,
    added: 0,
    refreshed: false,
  };
}

export function filterViewDevices(devices: ViewDeviceRow[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return devices;

  return devices.filter(
    (device) =>
      device.name.toLowerCase().includes(q) ||
      device.os.toLowerCase().includes(q) ||
      device.ipAddress.toLowerCase().includes(q) ||
      device.assetId.toLowerCase().includes(q)
  );
}

export function exportViewDevicesCsv(devices: ViewDeviceRow[]) {
  const header = ["Device Name", "Asset ID", "Operating System", "IP Address", "Status"];
  const rows = devices.map((device) => [
    device.name,
    device.assetId,
    device.os,
    device.ipAddress,
    device.status.toUpperCase(),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  downloadCsvInBrowser(csv, "enterprise-devices.csv", "text/csv");
}
