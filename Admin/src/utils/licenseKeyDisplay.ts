import type { SerialKey } from "../types";

export type LicenseKeyDisplay = {
  keyId: string;
  keyValue: string;
  expiryDate: string;
  status: string;
};

export const FIGMA_LICENSE_DISPLAY: LicenseKeyDisplay = {
  keyId: "",
  keyValue: "",
  expiryDate: "",
  status: "",
};

function formatExpiryDate(from?: string) {
  const date = from ? new Date(from) : new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDisplayStatus(status: string) {
  if (status === "unused") return "Active";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function serialKeyToLicenseDisplay(key: SerialKey): LicenseKeyDisplay {
  const year = key.generatedAt ? new Date(key.generatedAt).getFullYear() : new Date().getFullYear();

  return {
    keyId: `KEY-${String(key.serialId).padStart(4, "0")}-XX-${year}`,
    keyValue: key.serialKey,
    expiryDate: formatExpiryDate(key.generatedAt),
    status: formatDisplayStatus(key.status),
  };
}

export function createPreviewLicense(): LicenseKeyDisplay {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();

  return {
    keyId: `KEY-${String(Math.floor(Math.random() * 9000) + 1000)}-XX-${year}`,
    keyValue: `BK-SCAN-PRIME-${year}-${suffix}`,
    expiryDate: formatExpiryDate(),
    status: "Active",
  };
}

export type ExpirationPeriod = "30-days" | "1-year" | "2-years" | "never";

export type GenerateLicenseKeysFormData = {
  licenseType: string;
  keyCount: number;
  expirationPeriod: ExpirationPeriod;
  assignTo: string;
  deviceLimit: string;
  activateImmediately: boolean;
  requireFirstUseVerification: boolean;
  notifyAssignedOrganization: boolean;
  restrictToApprovedDevices: boolean;
  internalNotes: string;
};

export const GENERATE_LICENSE_KEYS_INITIAL: GenerateLicenseKeysFormData = {
  licenseType: "Enterprise",
  keyCount: 10,
  expirationPeriod: "30-days",
  assignTo: "",
  deviceLimit: "10 Devices",
  activateImmediately: true,
  requireFirstUseVerification: true,
  notifyAssignedOrganization: false,
  restrictToApprovedDevices: false,
  internalNotes: "",
};

export function formatExpirationPreview(period: ExpirationPeriod): string {
  if (period === "never") return "Never";

  const date = new Date();
  if (period === "30-days") {
    date.setDate(date.getDate() + 30);
  } else if (period === "1-year") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 2);
  }

  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatExpirationDisplayDate(period: ExpirationPeriod): string {
  if (period === "never") return "Never";

  const date = new Date();
  if (period === "30-days") {
    date.setDate(date.getDate() + 30);
  } else if (period === "1-year") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 2);
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function deviceLimitPerKey(deviceLimit: string): string {
  const match = deviceLimit.match(/\d+/);
  return match ? `${match[0]} / Key` : deviceLimit;
}

export function buildLicenseFromGenerateForm(data: GenerateLicenseKeysFormData): LicenseKeyDisplay {
  const year = new Date().getFullYear();
  const segment = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "X");

  return {
    keyId: `KEY-${String(Math.floor(Math.random() * 9000) + 1000)}-XX-${year}`,
    keyValue: `BUKO-${segment.slice(0, 4)}-${segment.slice(0, 4)}`,
    expiryDate: formatExpirationDisplayDate(data.expirationPeriod),
    status: data.activateImmediately ? "Active" : "Pending",
  };
}
