import type { RegisterUserFormData, RegisterUserRole } from "../components/portal/RegisterUserModal";

export type RegisteredUserSummary = {
  username: string;
  licenseKey: string;
  fullName: string;
  email: string;
  userId: string;
  role: RegisterUserRole;
  organization: string;
  registrationDate: string;
  createdBy: string;
  accountActive: boolean;
  sendWelcomeEmail: boolean;
  requirePasswordChange: boolean;
  portalUserId?: number;
};

type RegisterNoticeOptions = Pick<RegisterUserFormData, "sendWelcomeEmail" | "requirePasswordChange">;

export function getRegisterUserFullName(
  data: Pick<RegisterUserFormData, "firstName" | "middleInitial" | "lastName">
): string {
  const middle = data.middleInitial.trim();
  const parts = [data.firstName.trim()];
  if (middle) parts.push(middle);
  parts.push(data.lastName.trim());
  return parts.filter(Boolean).join(" ");
}

export function getRegisterAdminContactEmail(
  data: Pick<RegisterUserFormData, "adminContactEmail">,
): string {
  return data.adminContactEmail.trim();
}

export function getRegisterAdminContactPhone(
  data: Pick<RegisterUserFormData, "adminContactPhone">,
): string {
  return data.adminContactPhone.trim();
}

export function getRegisterUserEmail(data: Pick<RegisterUserFormData, "adminContactEmail">): string {
  return getRegisterAdminContactEmail(data);
}

export function getRegisterReviewNoticeMessage({
  sendWelcomeEmail,
  requirePasswordChange,
}: RegisterNoticeOptions): string | null {
  const parts: string[] = [];

  if (sendWelcomeEmail) {
    parts.push("A welcome email and temporary credentials will be sent to the registered email address.");
  }

  if (requirePasswordChange) {
    parts.push("The user will be required to change their password upon first login.");
  }

  if (parts.length === 0) return null;

  return parts.join(" ");
}

export function getRegisterSuccessNoticeMessage({
  sendWelcomeEmail,
  requirePasswordChange,
}: RegisterNoticeOptions): string | null {
  if (sendWelcomeEmail) {
    return "A welcome email containing login instructions has been sent to the user's registered email address.";
  }

  if (requirePasswordChange) {
    return "The user will be required to change their password upon first login.";
  }

  return null;
}

export const REGISTER_USER_ROLE_LABELS: Record<RegisterUserRole, string> = {
  administrator: "Administrator",
  manager: "Manager",
  support: "Support Staff",
  user: "User",
};

export function formatRegistrationDate(date: Date): string {
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart}, ${timePart}`;
}

export function formatRegisteredUserId(userId: number): string {
  return `BK-${String(userId).padStart(4, "0")}`;
}

export function generateRegisteredLicenseKey(): string {
  const block = Math.random().toString(36).slice(2, 5).toUpperCase();
  const digits = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `DS-${block}-${digits}.${suffix}`;
}

export function buildRegisteredUserSummary(
  data: RegisterUserFormData,
  overrides: Partial<RegisteredUserSummary> = {},
): RegisteredUserSummary {
  const fallbackId = 9000 + Math.floor(Math.random() * 1000);

  return {
    username: data.username.trim(),
    licenseKey: generateRegisteredLicenseKey(),
    fullName: getRegisterUserFullName(data),
    email: getRegisterUserEmail(data),
    userId: overrides.userId ?? formatRegisteredUserId(fallbackId),
    role: data.role,
    organization: data.company,
    registrationDate: overrides.registrationDate ?? formatRegistrationDate(new Date()),
    createdBy: overrides.createdBy ?? "",
    accountActive: data.accountActive,
    sendWelcomeEmail: data.sendWelcomeEmail,
    requirePasswordChange: data.requirePasswordChange,
    ...overrides,
  };
}
