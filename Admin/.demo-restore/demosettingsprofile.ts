export type SettingsNavId = "profile" | "notifications" | "activity" | "security";

export const SETTINGS_NAV_ITEMS: Array<{ id: SettingsNavId; label: string }> = [
  { id: "profile", label: "Profile Settings" },
  { id: "notifications", label: "Notification Preferences" },
  { id: "activity", label: "Activity History" },
  { id: "security", label: "Security Settings" },
];

export const DEMO_SETTINGS_PROFILE = {
  headerName: "Maria Dela Cruz",
  headerRole: "Administrator Officer",
  identityName: "Maria Dela Cruz",
  identityTitle: "Administrator Officer",
  fullName: "Maria Santos",
  email: "mariasantos@gmail.com",
  phone: "+63 912 345 6789",
  username: "admin.mariasantos",
  organization: "University of the Philippines",
  department: "Registrar",
  currentPassword: "",
  newPassword: "",
  avatarUrl:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
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
    currentPassword: DEMO_SETTINGS_PROFILE.currentPassword,
    newPassword: DEMO_SETTINGS_PROFILE.newPassword,
  };
}
