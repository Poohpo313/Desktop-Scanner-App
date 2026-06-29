import { USER_REGISTRATION_STATS } from "./demoUserRegistration";
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
  totalUsers: USER_REGISTRATION_STATS.registeredUsers,
  activeDevices: DEVICE_CATALOG_STATS.active,
  assignedKeys: LICENSE_KEY_CATALOG_USED_COUNT,
  availableKeys: LICENSE_KEY_CATALOG_UNUSED_COUNT,
  deviceTotal: DEVICE_CATALOG_STATS.total,
  deviceActive: DEVICE_CATALOG_STATS.active,
  deviceInactive: DEVICE_CATALOG_STATS.inactive,
  deviceAttention: 0,
  keyUtilizationPct:
    LICENSE_KEY_CATALOG_ASSIGNED_SERIAL_KEYS === 0
      ? 0
      : Math.round((LICENSE_KEY_CATALOG_USED_COUNT / LICENSE_KEY_CATALOG_ASSIGNED_SERIAL_KEYS) * 100),
  keysUsed: LICENSE_KEY_CATALOG_USED_COUNT,
  keysTotal: LICENSE_KEY_CATALOG_ASSIGNED_SERIAL_KEYS,
} as const;

export const DASHBOARD_ACTIVITY_ROW_COUNT = 0;

export const DASHBOARD_ACTIVITY_ROWS: DashboardActivityRow[] = [];

export const DASHBOARD_NOTIFICATIONS: DashboardNotification[] = [];
