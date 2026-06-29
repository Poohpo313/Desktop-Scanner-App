import type { ActivityLogApiRow } from "../api/activityLogs.api";
import type { UserConcernRow } from "../api/userConcerns.api";
import type { HelpSupportReportRow, HelpSupportReportStatus } from "../data/demoHelpSupportCatalog";
import type { DeviceCatalogRow, DeviceCatalogStatus } from "../data/demoDeviceCatalog";
import { isDeviceOnline } from "./statusDisplay";
import type {
  LicenseKeyCatalogRow,
  LicenseKeyCatalogStatus,
} from "../data/demoLicenseKeyCatalog";
import type { UserRegistrationRow } from "../data/demoUserRegistration";
import type { AdminUser, Device, SerialKey } from "../types";

export type AdminScope = {
  userId: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  company: string;
  department: string;
  departments: string[];
};

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDisplayDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-CA").format(new Date(value));
}

function formatHelpDateLines(value?: string | null) {
  if (!value) return { dateLine: "-", timeLine: "-" };
  const date = new Date(value);
  return {
    dateLine: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
    timeLine: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

export function mapUsersToRegistrationRows(
  users: AdminUser[],
  organization: string,
  keys: SerialKey[] = [],
  pendingRevocations: Array<{ requestType: string; targetId: number; status: string }> = [],
): UserRegistrationRow[] {
  const orgKey = slug(organization);

  return users.map((user) => {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.username;
      const department = (user as AdminUser & { department?: string }).department ?? "-";
      const userKey =
        keys.find((key) => key.assignedTo === user.userId) ??
        (user.serialKey
          ? keys.find((key) => key.serialKey === user.serialKey)
          : undefined);
      const pendingKeyRevoke = userKey
        ? pendingRevocations.some(
            (request) =>
              request.status === "pending" &&
              request.requestType === "key" &&
              request.targetId === userKey.serialId,
          )
        : false;

      let status: UserRegistrationRow["status"] =
        user.accountStatus === "active" ? "activated" : "inactive";

      if (userKey && (userKey.status === "revoked" || userKey.status === "deactivated")) {
        status = "revoked";
      } else if (pendingKeyRevoke) {
        status = "pending-revocation";
      }

      return {
        id: user.userId,
        name,
        username: user.username,
        initials: initials(name),
        organization: organization || (user as AdminUser & { company?: string }).company || "-",
        organizationKey: orgKey,
        department,
        serialKey: user.serialKey ?? userKey?.serialKey ?? "-",
        status,
        registeredDate: formatDisplayDate(user.createdAt),
      };
    });
}

export function buildRegistrationStats(users: UserRegistrationRow[], keys: SerialKey[]) {
  const assignedKeys = keys.filter(
    (key) => key.status === "unused" || key.status === "assigned" || key.status === "used",
  ).length;
  const activatedAccounts = users.filter((user) => user.status === "activated").length;

  return {
    assignedLicenseKeys: assignedKeys,
    registeredUsers: users.length,
    activeAccounts: activatedAccounts,
  };
}

export function buildDepartmentOptions(
  users: UserRegistrationRow[],
  includeAll = true,
): Array<{ value: string; label: string }> {
  const departments = Array.from(
    new Set(users.map((user) => user.department.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const options = departments.map((department) => ({
    value: department,
    label: department,
  }));

  return includeAll ? [{ value: "all", label: "Department" }, ...options] : options;
}

function mapKeyStatus(status: string): LicenseKeyCatalogStatus {
  return status === "used" || status === "assigned" ? "used" : "unused";
}

export function mapKeysToCatalogRows(
  keys: SerialKey[],
  users: AdminUser[],
  organization: string,
): LicenseKeyCatalogRow[] {
  const orgKey = slug(organization);

  return keys.map((key) => {
      const user = users.find((item) => item.userId === key.assignedTo);
      const company = (key as SerialKey & { company?: string }).company ?? organization;
      const department =
        (key as SerialKey & { department?: string }).department ??
        (user as AdminUser & { department?: string })?.department ??
        "-";
      const generatedDateIso = key.generatedAt?.slice(0, 10) ?? "";
      const expiresAt = (key as SerialKey & { expiresAt?: string | null }).expiresAt;

      return {
        id: key.serialId,
        serialKey: key.serialKey,
        username: user?.username ?? "-",
        company: company || organization,
        companyKey: orgKey,
        department,
        generatedDate: formatDisplayDate(key.generatedAt),
        generatedDateIso,
        expirationDate: expiresAt ? formatDisplayDate(expiresAt) : "Never",
        status: mapKeyStatus(key.status),
      };
    });
}

export function buildKeyCatalogStats(rows: LicenseKeyCatalogRow[]) {
  const used = rows.filter((row) => row.status === "used").length;
  const unused = rows.filter((row) => row.status === "unused").length;

  return {
    assignedSerialKeys: rows.length,
    used,
    unused,
  };
}

export function buildKeyDepartmentOptions(rows: LicenseKeyCatalogRow[]) {
  const departments = Array.from(new Set(rows.map((row) => row.department).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );

  return [
    { value: "all" as const, label: "All Department" },
    ...departments.map((department) => ({
      value: department,
      label: department,
    })),
  ];
}

function mapDeviceStatus(device: Device): DeviceCatalogStatus {
  return isDeviceOnline(device) ? "active" : "inactive";
}

export function mapDevicesToCatalogRows(
  devices: Device[],
  users: AdminUser[],
  organization: string,
): DeviceCatalogRow[] {
  return devices.map((device) => {
      const user = users.find((item) => Number(item.userId) === Number(device.assignedUser));

      const department = user
        ? ((user as AdminUser & { department?: string }).department ?? "-")
        : "-";
      const registeredUser = user
        ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.username
        : "Registered User";

      return {
        id: device.deviceId,
        deviceName: device.deviceName ?? "Unknown device",
        serialKey: device.serialNumber ?? "-",
        registeredUser,
        department,
        departmentKey: slug(department) as DeviceCatalogRow["departmentKey"],
        status: mapDeviceStatus(device),
        registrationStatus: device.status ?? "active",
      };
    });
}

export function buildDeviceDepartmentOptions(rows: DeviceCatalogRow[]) {
  const departments = Array.from(new Set(rows.map((row) => row.department).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );

  return [
    { value: "all" as const, label: "All Departments" },
    ...departments.map((department) => ({
      value: department,
      label: department,
    })),
  ];
}

export function buildDeviceStats(rows: DeviceCatalogRow[]) {
  const active = rows.filter((row) => row.status === "active").length;
  return {
    total: rows.length,
    active,
    inactive: rows.length - active,
  };
}

function mapLogStatus(action: string): HelpSupportReportStatus {
  const normalized = action.toLowerCase();
  if (normalized.includes("resolved") || normalized.includes("restored")) return "resolved";
  if (normalized.includes("pending")) return "pending";
  if (normalized.includes("progress")) return "in-progress";
  if (normalized.includes("closed")) return "closed";
  return "open";
}

export function mapUserConcernsToHelpReports(
  concerns: UserConcernRow[],
): HelpSupportReportRow[] {
  return concerns.map((concern) => {
    const { dateLine, timeLine } = formatHelpDateLines(concern.timestamp);
    const handle = concern.username;

    return {
      id: String(concern.id),
      handle,
      organization: concern.company ?? "-",
      department: concern.department ?? "-",
      subject: concern.subject,
      category: concern.category,
      concernType: concern.concernType,
      message: concern.message,
      email: concern.email,
      rating: concern.rating,
      dateLine,
      timeLine,
      status: mapLogStatus(concern.status),
    };
  });
}

export function mapActivityLogsToHelpReports(
  logs: ActivityLogApiRow[],
  organization: string,
): HelpSupportReportRow[] {
  return logs.map((log, index) => {
    const { dateLine, timeLine } = formatHelpDateLines(log.timestamp);
    const handle = log.username ?? log.email ?? `user-${index + 1}`;
    const subject = log.action.replace(/\./g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

    return {
      id: log.id || String(index + 1),
      handle,
      organization,
      department: "-",
      subject,
      category: "System Activity",
      concernType: "activity",
      message:
        log.details && typeof log.details === "object"
          ? JSON.stringify(log.details)
          : subject,
      email: log.email ?? null,
      rating: null,
      dateLine,
      timeLine,
      status: mapLogStatus(log.action),
    };
  });
}

export function buildHelpStats(rows: HelpSupportReportRow[]) {
  const resolved = rows.filter((row) => row.status === "resolved" || row.status === "closed").length;
  const open = rows.filter((row) => row.status === "open" || row.status === "pending").length;

  return {
    total: rows.length,
    totalHint: "All support-related activity",
    resolved,
    resolvedHint: "Resolved or closed items",
    open,
    openHint: "Needs attention",
  };
}
