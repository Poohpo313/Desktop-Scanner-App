import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "src", "data");
const skip = new Set(["demoSettingsNotifications.ts"]);

const S = (strings, ...values) => strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");

const stubs = {};

stubs["demoDashboard.ts"] = S`import { USER_REGISTRATION_STATS } from "./demoUserRegistration";
import { DEVICE_CATALOG_STATS } from "./demoDeviceCatalog";
import {
  LICENSE_KEY_CATALOG_ASSIGNED_SERIAL_KEYS,
  LICENSE_KEY_CATALOG_USED_COUNT,
  LICENSE_KEY_CATALOG_UNUSED_COUNT,
} from "./demoLicenseKeyCatalog";

export type DashboardNotificationIconTone = "blue" | "green" | "yellow" | "gray";

export type DashboardActivityStatus = "success" | "pending" | "failed";

export type DashboardActivityRow = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  action: string;
  status: DashboardActivityStatus;
  timestamp: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  subtitle: string;
  iconTone: DashboardNotificationIconTone;
};

export const DASHBOARD_FIGMA_STATS = {
  totalUsers: 0,
  activeDevices: 0,
  assignedKeys: 0,
  availableKeys: 0,
  deviceTotal: 0,
  deviceActive: 0,
  deviceInactive: 0,
  deviceAttention: 0,
  keyUtilizationPct: 0,
  keysUsed: 0,
  keysTotal: 0,
} as const;

export const DASHBOARD_ACTIVITY_ROW_COUNT = 0;

export const DASHBOARD_ACTIVITY_ROWS: DashboardActivityRow[] = [];

export const DASHBOARD_NOTIFICATIONS: DashboardNotification[] = [];
`;

// placeholder - will append more stubs in next write
