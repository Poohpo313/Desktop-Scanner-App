import type { DeviceStatus, ManagedDevice } from "../components/devices/devicesData";
import { deviceNamesMatch } from "./deviceNameMatch";

type HardwareDevice = {
  id: string;
  name: string;
};

function dedupeHardwareDevices<T extends HardwareDevice>(devices: T[]): T[] {
  const result: T[] = [];

  for (const device of devices) {
    const matchIndex = result.findIndex((entry) => deviceNamesMatch(entry.name, device.name));
    if (matchIndex === -1) {
      result.push(device);
      continue;
    }

    if (device.name.toLowerCase().includes("wia")) {
      result[matchIndex] = device;
    }
  }

  return result;
}
export function resolveManagedDeviceStatus(
  device: ManagedDevice,
  scanners: HardwareDevice[],
  printers: HardwareDevice[],
): DeviceStatus {
  if (device.kind === "printer") {
    return printers.some((printer) => deviceNamesMatch(printer.name, device.name))
      ? "connected"
      : "offline";
  }

  return scanners.some(
    (scanner) => scanner.id === device.id || deviceNamesMatch(scanner.name, device.name),
  )
    ? "connected"
    : "offline";
}

export function diagnosticsLabelForStatus(device: ManagedDevice, status: DeviceStatus): string {
  if (status !== "connected") {
    return device.kind === "printer" ? "Printer not detected" : "Scanner not detected";
  }
  return device.kind === "printer" ? "Ready to print" : "Ready to scan";
}

export async function probeHardwareDevices(): Promise<{
  scanners: HardwareDevice[];
  printers: HardwareDevice[];
}> {
  if (!window.bukolabs) {
    return { scanners: [], printers: [] };
  }

  const [scannerResult, printerResult] = await Promise.all([
    window.bukolabs.scanner?.listDevices?.().catch(() => ({ devices: [] as HardwareDevice[] })),
    window.bukolabs.print?.listPrinters?.().catch(() => ({ printers: [] as HardwareDevice[] })),
  ]);

  return {
    scanners: dedupeHardwareDevices(scannerResult?.devices ?? []),
    printers: printerResult?.printers ?? [],
  };
}

export function countLiveScanners(scanners: HardwareDevice[]): number {
  return scanners.length;
}

export function countLivePrinters(printers: HardwareDevice[]): number {
  return printers.filter((printer) => !printer.name.toLowerCase().includes("pdf")).length;
}
