import type { AdminUser, SerialKey } from "../types";
import { displayKeyStatus } from "./demoKeys";

export type LicenseDetailsView = {
  keyIdentifier: string;
  licenseKey: string;
  statusLabel: string;
  statusVariant: "assigned" | "active" | "revoked" | "available";
  assignedUserName: string;
  assignedUserTitle: string;
  assignedUserAvatar: string;
  dateAssigned: string;
  expiryDate: string;
  hasAssignedUser: boolean;
};

const USER_AVATARS: string[] = [];

const USER_TITLES: Record<string, string> = {};

function statusVariant(status: string): LicenseDetailsView["statusVariant"] {
  if (status === "assigned" || status === "used") return "assigned";
  if (status === "revoked" || status === "deactivated") return "revoked";
  if (status === "unused") return "available";
  return "active";
}

function formatDisplayDate(value: string, fallback: string): string {
  if (!value || value === "—") return fallback;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const slashParts = value.split("/");
  if (slashParts.length === 3) {
    const [month, day, year] = slashParts;
    const reconstructed = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(reconstructed.getTime())) {
      return reconstructed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  }

  return value;
}

function addOneYear(dateLabel: string): string {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) return "—";
  parsed.setFullYear(parsed.getFullYear() + 1);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatLicenseKeyDisplay(keyIdentifier: string, rawKey?: string): string {
  if (keyIdentifier === "KEY001") {
    return "XXXX-XXXX-KEY-001-ADMIN";
  }

  if (rawKey && rawKey.includes("-")) {
    return rawKey.toUpperCase();
  }

  const numeric = keyIdentifier.replace(/\D/g, "") || "001";
  return `XXXX-XXXX-KEY-${numeric.padStart(3, "0")}-ADMIN`;
}

export function buildLicenseDetailsFromRow(row: {
  id: string | number;
  key: string;
  user: string;
  status: string;
  date: string;
}): LicenseDetailsView {
  const keyIdentifier = String(row.id);
  const hasAssignedUser = row.user !== "—" && Boolean(row.user.trim());
  const dateAssigned = formatDisplayDate(row.date, "—");

  return {
    keyIdentifier,
    licenseKey: formatLicenseKeyDisplay(keyIdentifier, row.key),
    statusLabel: displayKeyStatus(row.status),
    statusVariant: statusVariant(row.status),
    assignedUserName: hasAssignedUser ? row.user : "Unassigned",
    assignedUserTitle: hasAssignedUser ? (USER_TITLES[row.user] ?? "Team Member") : "No user linked",
    assignedUserAvatar: USER_AVATARS[0] ?? "",
    dateAssigned,
    expiryDate: addOneYear(dateAssigned),
    hasAssignedUser,
  };
}

export function buildLicenseDetailsFromSerialKey(key: SerialKey, users?: AdminUser[]): LicenseDetailsView {
  const assignee = key.assignedTo ? users?.find((user) => user.userId === key.assignedTo) : undefined;
  const userName = assignee
    ? `${assignee.firstName ?? ""} ${assignee.lastName ?? ""}`.trim() || assignee.username
    : "—";
  const keyIdentifier = `KEY${String(key.serialId).padStart(3, "0")}`;
  const dateAssigned = formatDisplayDate(key.generatedAt ?? key.usedAt ?? "", "—");
  const hasAssignedUser = userName !== "—";

  return {
    keyIdentifier,
    licenseKey: formatLicenseKeyDisplay(keyIdentifier, key.serialKey),
    statusLabel: displayKeyStatus(key.status),
    statusVariant: statusVariant(key.status),
    assignedUserName: hasAssignedUser ? userName : "Unassigned",
    assignedUserTitle: hasAssignedUser ? (USER_TITLES[userName] ?? assignee?.username ?? "Team Member") : "No user linked",
    assignedUserAvatar: USER_AVATARS[(key.serialId ?? 0) % Math.max(USER_AVATARS.length, 1)] ?? "",
    dateAssigned,
    expiryDate: addOneYear(dateAssigned),
    hasAssignedUser,
  };
}
