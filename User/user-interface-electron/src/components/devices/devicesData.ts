export type DeviceKind = "scanner" | "printer" | "multifunction";

export type DeviceStatus = "connected" | "offline";

export type ManagedDevice = {
  id: string;
  name: string;
  kind: DeviceKind;
  connectionLabel: string;
  status: DeviceStatus;
  connection: string;
  serialNumber: string;
  driver: string;
  resolution?: string;
  maxScanSize?: string;
  paperSize?: string;
  diagnosticsStatus: string;
  diagnosticsHealthy: boolean;
};

export const DEVICE_PROFILES: ManagedDevice[] = [];

export function scanDeviceToManagedDevice(device: {
  id: string;
  name: string;
  type: string;
  driver: string;
  connection?: string;
}): ManagedDevice {
  const kind: DeviceKind =
    device.type === "multifunction"
      ? "multifunction"
      : device.type === "printer"
        ? "printer"
        : "scanner";
  const kindLabel = deviceKindLabel(kind);
  const connection = device.connection ?? "System";

  const base: ManagedDevice = {
    id: device.id,
    name: device.name,
    kind,
    connectionLabel: `${kindLabel} - ${connection}`,
    status: "connected",
    connection,
    serialNumber: device.id.startsWith("dev-") ? device.id.replace(/^dev-/, "SN-") : device.id,
    driver: device.driver,
    diagnosticsStatus: kind === "printer" ? "Ready to print" : "No issues found",
    diagnosticsHealthy: true,
  };

  if (kind === "printer") {
    return { ...base, paperSize: "A4 / Letter" };
  }

  if (kind === "multifunction") {
    return {
      ...base,
      resolution: "600 DPI Max",
      maxScanSize: "A4",
      paperSize: "A4 / Letter",
    };
  }

  return {
    ...base,
    resolution: "600 DPI Max",
    maxScanSize: "A4",
  };
}

export function deviceTestActionLabel(device: ManagedDevice): string {
  if (device.kind === "scanner" || device.kind === "multifunction") return "Test Scan";
  return "Test Print";
}

export function deviceKindLabel(kind: DeviceKind): string {
  if (kind === "scanner") return "Scanner";
  if (kind === "printer") return "Printer";
  return "Multifunction";
}

export function isScanCapableDevice(device: ManagedDevice): boolean {
  return device.kind === "scanner" || device.kind === "multifunction";
}

export function deviceStatusLabel(status: DeviceStatus): string {
  return status === "connected" ? "Connected" : "Offline";
}

export function getManagedDeviceById(id: string): ManagedDevice | undefined {
  return DEVICE_PROFILES.find((device) => device.id === id);
}

export type ConnectionType = "usb" | "network" | "wifi";

export type AddDevicePayload = {
  kind: DeviceKind;
  name: string;
  connectionType: ConnectionType;
};

const CONNECTION_DETAILS: Record<ConnectionType, { connection: string; labelSuffix: string }> = {
  usb: { connection: "USB 2.0", labelSuffix: "USB" },
  network: { connection: "Network", labelSuffix: "Network" },
  wifi: { connection: "Wi-Fi", labelSuffix: "Wi-Fi" },
};

function slugifyDeviceName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildManagedDeviceFromForm(payload: AddDevicePayload): ManagedDevice {
  const trimmedName = payload.name.trim();
  const details = CONNECTION_DETAILS[payload.connectionType];
  const kindLabel = deviceKindLabel(payload.kind);
  const id = `custom-${slugifyDeviceName(trimmedName) || payload.kind}-${Date.now()}`;

  const base: ManagedDevice = {
    id,
    name: trimmedName,
    kind: payload.kind,
    connectionLabel: `${kindLabel} - ${details.labelSuffix}`,
    status: "connected",
    connection: details.connection,
    serialNumber: `SN-${Date.now().toString().slice(-8)}`,
    driver:
      payload.kind === "printer"
        ? "Generic Print Driver 1.0.0"
        : "Generic TWAIN Driver 1.0.0",
    diagnosticsStatus:
      payload.kind === "printer" ? "Ready to print" : "No issues found",
    diagnosticsHealthy: true,
  };

  if (payload.kind === "printer") {
    return {
      ...base,
      paperSize: "A4 / Letter",
    };
  }

  if (payload.kind === "multifunction") {
    return {
      ...base,
      resolution: "600 DPI Max",
      maxScanSize: "A4",
      paperSize: "A4 / Letter",
    };
  }

  return {
    ...base,
    resolution: "600 DPI Max",
    maxScanSize: "A4",
  };
}

export function managedDeviceRegistrationPayload(
  device: ManagedDevice,
  userId: number,
  username?: string | null,
) {
  return {
    deviceName: device.name,
    deviceType: device.kind,
    serialNumber: device.serialNumber || device.id,
    assignedUser: userId,
    username: username?.trim() || undefined,
  };
}
