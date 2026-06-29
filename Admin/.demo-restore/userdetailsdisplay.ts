import type { AdminUser } from "../types";
import {
  DEMO_ADMIN_USER,
  DEMO_LICENSE_KEY,
  demoRowToAdminUser,
  getDemoAdminUserById,
  getFigmaUserListRow,
} from "./demoUsers";

export type UserActivityEntry = {
  id: string;
  date: string;
  time: string;
  description: string;
  icon: "reset" | "key" | "account";
  status: "success" | "pending";
};

export type UserDetailsProfile = {
  userId: number;
  initials: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  registeredAt: string;
  statusLabel: string;
  isActive: boolean;
  serialKey: string;
  licenseActivation: string;
  licenseKeyStatus: string;
  lastLogin: string;
  totalScans: string;
  documents: string;
  device: string;
  activities: UserActivityEntry[];
};

type UserMetrics = {
  lastLogin: string;
  totalScans: string;
  documents: string;
  device: string;
  licenseActivation: string;
};

const METRICS_BY_USERNAME: Record<string, UserMetrics> = {
  john_doe: {
    lastLogin: "2 hours ago",
    totalScans: "1,248",
    documents: "856",
    device: "Scanner v4.2",
    licenseActivation: "Oct 24, 2023",
  },
  asmith: {
    lastLogin: "5 hours ago",
    totalScans: "982",
    documents: "641",
    device: "Scanner v4.1",
    licenseActivation: "Oct 22, 2023",
  },
  jcruz: {
    lastLogin: "3 days ago",
    totalScans: "412",
    documents: "288",
    device: "Scanner v3.9",
    licenseActivation: "Oct 21, 2023",
  },
  mlee: {
    lastLogin: "Yesterday",
    totalScans: "1,104",
    documents: "723",
    device: "Scanner v4.2",
    licenseActivation: "Oct 20, 2023",
  },
};

function metricsForUser(user: AdminUser): UserMetrics {
  if (METRICS_BY_USERNAME[user.username]) {
    return METRICS_BY_USERNAME[user.username];
  }

  const id = user.userId;
  const scanBase = 400 + (id * 137) % 1400;
  const docBase = Math.round(scanBase * 0.68);

  return {
    lastLogin: id % 4 === 0 ? "Yesterday" : id % 3 === 0 ? "1 day ago" : `${2 + (id % 8)} hours ago`,
    totalScans: scanBase.toLocaleString(),
    documents: docBase.toLocaleString(),
    device: id % 2 === 0 ? "Scanner v4.2" : "Scanner v4.1",
    licenseActivation: user.createdAt
      ? new Date(new Date(user.createdAt).getTime() + 2 * 86400000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
  };
}

function activitiesForUser(user: AdminUser, serialKey: string, registeredAt: string): UserActivityEntry[] {
  const keyLabel = serialKey !== "—" ? serialKey : DEMO_LICENSE_KEY;
  const entries: UserActivityEntry[] = [
    {
      id: "1",
      date: registeredAt !== "—" ? shiftDateLabel(registeredAt, 2) : "Oct 24, 2023",
      time: "10:24 AM",
      description: "Password Reset Requested",
      icon: "reset",
      status: "success",
    },
  ];

  if (serialKey !== "—") {
    entries.push({
      id: "2",
      date: registeredAt !== "—" ? shiftDateLabel(registeredAt, 1) : "Oct 23, 2023",
      time: "04:15 PM",
      description: `License Key Assigned (${keyLabel})`,
      icon: "key",
      status: "success",
    });
  }

  entries.push({
    id: "3",
    date: registeredAt !== "—" ? registeredAt : "Oct 22, 2023",
    time: "09:12 AM",
    description: "Account Initialized",
    icon: "account",
    status: user.accountStatus === "active" ? "success" : "pending",
  });

  return entries;
}

function shiftDateLabel(dateLabel: string, daysBack: number) {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) return dateLabel;
  parsed.setDate(parsed.getDate() + daysBack);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initialsFromName(first?: string | null, last?: string | null, username?: string) {
  const firstInitial = first?.trim()?.[0] ?? "";
  const lastInitial = last?.trim()?.[0] ?? "";
  const combined = `${firstInitial}${lastInitial}`.toUpperCase();
  if (combined) return combined;
  return (username?.slice(0, 2) ?? "U").toUpperCase();
}

function formatRegistrationDate(value?: string, fallback?: string) {
  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  }
  return fallback ?? "—";
}

function profileFromAdminUser(user: AdminUser, registeredAtFallback?: string): UserDetailsProfile {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username;
  const isActive = user.accountStatus === "active";
  const serialKey = user.serialKey || "—";
  const registeredAt =
    registeredAtFallback ?? formatRegistrationDate(user.createdAt);
  const metrics = metricsForUser(user);

  return {
    userId: user.userId,
    initials: initialsFromName(user.firstName, user.lastName, user.username),
    fullName,
    username: user.username,
    email: user.email ?? "—",
    phoneNumber: user.phoneNumber ?? "—",
    registeredAt,
    statusLabel: isActive ? "Active Member" : "Inactive Member",
    isActive,
    serialKey,
    licenseActivation: serialKey !== "—" ? metrics.licenseActivation : "—",
    licenseKeyStatus: isActive && serialKey !== "—" ? "Active" : serialKey !== "—" ? "Inactive" : "Unassigned",
    lastLogin: metrics.lastLogin,
    totalScans: metrics.totalScans,
    documents: metrics.documents,
    device: metrics.device,
    activities: activitiesForUser(user, serialKey, registeredAt),
  };
}

export const DEMO_USER_DETAILS: UserDetailsProfile = profileFromAdminUser(
  DEMO_ADMIN_USER,
  "Oct 22, 2023"
);

export function buildDemoDetailsProfile(userId?: number | string): UserDetailsProfile {
  const id = Number(userId);
  if (!Number.isFinite(id) || id < 1) {
    return DEMO_USER_DETAILS;
  }

  const row = getFigmaUserListRow(id - 1);
  const user = demoRowToAdminUser(row);
  return profileFromAdminUser(user, row.registeredAt);
}

export function buildUserDetailsProfile(user?: AdminUser | null): UserDetailsProfile {
  if (!user) return DEMO_USER_DETAILS;
  return profileFromAdminUser(user);
}

export { getDemoAdminUserById };
