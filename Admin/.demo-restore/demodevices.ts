export const FIGMA_DEVICE_TOTAL = 125;
export const FIGMA_DEVICE_PAGE_COUNT = 42;

export const FIGMA_DEVICE_STATS = {
  connected: 942,
  active: 900,
  inactive: 32,
  unauthorized: 10,
};

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

export const DEMO_DEVICE_LIST: DemoDeviceRow[] = [
  {
    id: "KB-SCN-R941",
    name: "Scanner A",
    type: "Peripheral",
    typeVariant: "peripheral",
    user: "Johnathan D.",
    status: "active",
    internet: "connected",
  },
  {
    id: "KS-PRT-B238",
    name: "Printer B",
    type: "Output Device",
    typeVariant: "output",
    user: "Sarah Jenkins",
    status: "inactive",
    internet: "disconnected",
  },
  {
    id: "KS-SCN-G112",
    name: "Scanner C",
    type: "Peripheral",
    typeVariant: "peripheral",
    user: "Unknown Guest",
    status: "unauthorized",
    internet: "blocked",
  },
];

const DEVICE_NAMES = ["Scanner A", "Scanner B", "Printer A", "Printer B", "Scanner C", "Hub D"];
const DEVICE_TYPES: Array<{ label: string; variant: DeviceTypeVariant }> = [
  { label: "Peripheral", variant: "peripheral" },
  { label: "Output Device", variant: "output" },
];
const DEVICE_USERS = ["Johnathan D.", "Sarah Jenkins", "Maria Santos", "Unknown Guest", "Alex Nguyen"];

function syntheticStatus(index: number): DeviceDisplayStatus {
  if (index % 11 === 0) return "unauthorized";
  if (index % 5 === 0) return "inactive";
  return "active";
}

function syntheticInternet(status: DeviceDisplayStatus): DeviceInternetStatus {
  if (status === "unauthorized") return "blocked";
  if (status === "inactive") return "disconnected";
  return "connected";
}

export function getFigmaDeviceListRow(index: number): DemoDeviceRow {
  if (index < DEMO_DEVICE_LIST.length) {
    return { ...DEMO_DEVICE_LIST[index] };
  }

  const status = syntheticStatus(index);
  const type = DEVICE_TYPES[index % DEVICE_TYPES.length];

  return {
    id: `KB-${type.variant === "output" ? "PRT" : "SCN"}-${String(1000 + index).slice(-4)}`,
    name: DEVICE_NAMES[index % DEVICE_NAMES.length],
    type: type.label,
    typeVariant: type.variant,
    user: DEVICE_USERS[index % DEVICE_USERS.length],
    status,
    internet: syntheticInternet(status),
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
