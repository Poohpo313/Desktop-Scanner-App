import {
  isScanCapableDevice,
  type ManagedDevice,
} from "../components/devices/devicesData";
import {
  type ScannerDevice,
} from "../components/scan/offline/scanOfflineData";
import type { ScanDevice } from "../hooks/useScanner";
import { deviceNamesMatch } from "./deviceNameMatch";

function scannerTypeLabel(device: ManagedDevice): string {
  if (device.kind === "multifunction") return "Multifunction Scanner";
  if (device.maxScanSize?.toLowerCase().includes("adf")) return "ADF Scanner";
  return "Flatbed Scanner";
}

export function managedDeviceToScanner(device: ManagedDevice): ScannerDevice | null {
  if (!isScanCapableDevice(device)) return null;

  return {
    id: device.id,
    name: device.name,
    type: scannerTypeLabel(device),
    connection: device.connection,
    status: device.status === "connected" ? "ready" : "offline",
    resolutionMax: device.resolution ?? "600 DPI",
    colorDepth: "48-bit",
  };
}

function findApiMatch(device: ManagedDevice, apiDevices: ScanDevice[]): ScanDevice | undefined {
  return apiDevices.find(
    (entry) => entry.id === device.id || deviceNamesMatch(entry.name, device.name),
  );
}

function apiDeviceToScanner(device: ScanDevice): ScannerDevice | null {
  if (device.id === "local-default-scanner") return null;
  if (device.type === "printer") return null;

  return {
    id: device.id,
    name: device.name,
    type: device.type === "multifunction" ? "Multifunction Scanner" : "Flatbed Scanner",
    connection: device.connection ?? "System",
    status: "ready",
    resolutionMax: "600 DPI",
    colorDepth: "48-bit",
  };
}

export function mergeScannerList(
  managedDevices: ManagedDevice[],
  apiDevices: ScanDevice[] = [],
): ScannerDevice[] {
  const scanners: ScannerDevice[] = [];
  const seenIds = new Set<string>();

  const isDuplicate = (scanner: ScannerDevice) =>
    scanners.some((entry) => deviceNamesMatch(entry.name, scanner.name));

  for (const device of managedDevices) {
    const scanner = managedDeviceToScanner(device);
    if (!scanner) continue;

    const apiMatch = findApiMatch(device, apiDevices);
    const status = apiMatch ? "ready" : "offline";
    const resolvedId = apiMatch?.id ?? scanner.id;
    const resolved = { ...scanner, id: resolvedId, status };

    if (isDuplicate(resolved)) continue;

    scanners.push(resolved);
    seenIds.add(resolvedId);
  }

  for (const apiDevice of apiDevices) {
    const scanner = apiDeviceToScanner(apiDevice);
    if (!scanner) continue;
    if (seenIds.has(scanner.id) || isDuplicate(scanner)) continue;
    scanners.push(scanner);
    seenIds.add(scanner.id);
  }

  return scanners;
}

export async function discoverScanners(managedDevices: ManagedDevice[]): Promise<ScannerDevice[]> {
  let apiDevices: ScanDevice[] = [];

  try {
    const response = (await window.bukolabs?.scanner?.listDevices()) as {
      devices?: ScanDevice[];
    } | undefined;
    apiDevices = response?.devices ?? [];
  } catch {
    apiDevices = [];
  }

  return mergeScannerList(managedDevices, apiDevices);
}

export function getInitialScannerList(managedDevices: ManagedDevice[] = []): ScannerDevice[] {
  return mergeScannerList(managedDevices);
}

export async function getLiveScannerList(
  managedDevices: ManagedDevice[] = [],
): Promise<ScannerDevice[]> {
  return discoverScanners(managedDevices);
}
