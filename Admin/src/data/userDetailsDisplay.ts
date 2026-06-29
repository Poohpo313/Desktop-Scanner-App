import type { AdminUser } from "../types";
import {
  DEMO_ADMIN_USER,
  getDemoAdminUserById,
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

const EMPTY_METRICS: UserMetrics = {
  lastLogin: "—",
  totalScans: "—",
  documents: "—",
  device: "—",
  licenseActivation: "—",
};

function metricsForUser(user: AdminUser): UserMetrics {
  if (!user.userId) {
    return EMPTY_METRICS;
  }

  return {
    lastLogin: "—",
    totalScans: "—",
    documents: "—",
    device: "—",
    licenseActivation: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
  };
}

function activitiesForUser(user: AdminUser, serialKey: string, registeredAt: string): UserActivityEntry[] {
  if (!user.userId) {
    return [];
  }

  const entries: UserActivityEntry[] = [];

  if (serialKey !== "—") {
    entries.push({
      id: "1",
      date: registeredAt !== "—" ? registeredAt : "—",
      time: "—",
      description: `Serial Key Assigned (${serialKey})`,
      icon: "key",
      status: "success",
    });
  }

  entries.push({
    id: "2",
    date: registeredAt !== "—" ? registeredAt : "—",
    time: "—",
    description: "Account Initialized",
    icon: "account",
    status: user.accountStatus === "active" ? "success" : "pending",
  });

  return entries;
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
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "—";
  const isActive = user.accountStatus === "active";
  const serialKey = user.serialKey || "—";
  const registeredAt = registeredAtFallback ?? formatRegistrationDate(user.createdAt);
  const metrics = metricsForUser(user);

  return {
    userId: user.userId,
    initials: initialsFromName(user.firstName, user.lastName, user.username),
    fullName,
    username: user.username || "—",
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

export const DEMO_USER_DETAILS: UserDetailsProfile = profileFromAdminUser(DEMO_ADMIN_USER);

export function applyStatusToProfile(
  profile: UserDetailsProfile,
  status: "active" | "inactive" | null
): UserDetailsProfile {
  if (!status) return profile;

  const isActive = status === "active";
  return {
    ...profile,
    isActive,
    statusLabel: isActive ? "Active Member" : "Inactive Member",
    licenseKeyStatus:
      profile.serialKey !== "—" ? (isActive ? "Active" : "Inactive") : profile.licenseKeyStatus,
  };
}

export function buildUserDetailsProfileById(userId?: number | string): UserDetailsProfile {
  const id = Number(userId);
  if (!Number.isFinite(id) || id < 1) {
    return DEMO_USER_DETAILS;
  }

  return profileFromAdminUser(getDemoAdminUserById(id));
}

/** @deprecated use buildUserDetailsProfileById */
export const buildDemoDetailsProfile = buildUserDetailsProfileById;

export function buildUserDetailsProfile(user?: AdminUser | null): UserDetailsProfile {
  if (!user) return DEMO_USER_DETAILS;
  return profileFromAdminUser(user);
}

export { getDemoAdminUserById };
