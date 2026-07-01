export type SettingsNavId = "profile" | "notifications" | "activity";

export const SETTINGS_NAV_ITEMS: Array<{ id: SettingsNavId; label: string }> = [
  { id: "profile", label: "Profile Settings" },
  { id: "notifications", label: "Notification Preferences" },
  { id: "activity", label: "Revocations and Bins Request" },
];

export const ADMINISTRATOR_OFFICER_ROLE = "Administrator Officer";
import { DEFAULT_ADMIN_PASSWORD } from "../lib/knownPassword";
export { DEFAULT_ADMIN_PASSWORD };

export const DEMO_SETTINGS_PROFILE = {
  headerName: "",
  headerRole: ADMINISTRATOR_OFFICER_ROLE,
  identityName: "",
  identityTitle: ADMINISTRATOR_OFFICER_ROLE,
  sidebarRole: ADMINISTRATOR_OFFICER_ROLE,
  sidebarUsername: "",
  fullName: "",
  email: "",
  phone: "",
  username: "",
  organization: "",
  department: "",
  currentPassword: "",
  newPassword: "",
  avatarUrl: "",
} as const;

export type SettingsFormValues = {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  organization: string;
  department: string;
  currentPassword: string;
  newPassword: string;
};

export function getDefaultSettingsFormValues(): SettingsFormValues {
  return {
    fullName: DEMO_SETTINGS_PROFILE.fullName,
    email: DEMO_SETTINGS_PROFILE.email,
    phone: DEMO_SETTINGS_PROFILE.phone,
    username: DEMO_SETTINGS_PROFILE.username,
    organization: DEMO_SETTINGS_PROFILE.organization,
    department: DEMO_SETTINGS_PROFILE.department,
    currentPassword: DEFAULT_ADMIN_PASSWORD,
    newPassword: DEMO_SETTINGS_PROFILE.newPassword,
  };
}

export type PasswordRequirementCheck = {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
};

export function getPasswordRequirementCheck(password: string): PasswordRequirementCheck {
  return {
    hasMinLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecialCharacter: /[^A-Za-z0-9]/.test(password),
  };
}

export function isNewPasswordValid(password: string): boolean {
  const check = getPasswordRequirementCheck(password);
  return check.hasMinLength && check.hasNumber && check.hasSpecialCharacter;
}
