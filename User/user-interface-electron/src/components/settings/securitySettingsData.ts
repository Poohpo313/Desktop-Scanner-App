export type SecurityOption = {
  id: string;
  label: string;
  description: string;
  badge?: string;
};

export const APP_LOCK_OPTIONS: SecurityOption[] = [
  {
    id: "off",
    label: "Off",
    description: "The app will not lock automatically.",
  },
  {
    id: "1",
    label: "1 minute",
    description: "Best for highly confidential workstations.",
  },
  {
    id: "5",
    label: "5 minutes",
    description: "Recommended balance between security and usability.",
  },
  {
    id: "10",
    label: "10 minutes",
    description: "Allows a longer idle time before locking.",
  },
  {
    id: "30",
    label: "30 minutes",
    description: "Use only for low-risk environments.",
  },
];

export const SESSION_TIMEOUT_OPTIONS: SecurityOption[] = [
  {
    id: "15",
    label: "15 minutes",
    description: "Locks the session after a short idle period.",
  },
  {
    id: "30",
    label: "30 minutes",
    description: "Recommended for shared office workstations.",
  },
  {
    id: "60",
    label: "1 hour",
    description: "Allows longer sessions before requiring sign-in again.",
  },
  {
    id: "120",
    label: "2 hours",
    description: "Best for low-risk, single-user environments.",
  },
  {
    id: "never",
    label: "Never",
    description: "Keep the session active until the app is closed.",
  },
];

export const REMOVABLE_STORAGE_OPTIONS: SecurityOption[] = [
  {
    id: "allowed",
    label: "Allowed",
    description: "Users can read and save files to removable storage.",
  },
  {
    id: "read-only",
    label: "Read-only",
    description: "Users can view external files but cannot save scans to USB.",
  },
  {
    id: "block-export",
    label: "Block export only",
    description: "Users cannot export scanned documents to removable drives.",
  },
  {
    id: "block-all",
    label: "Block all removable storage",
    description: "USB and external drives are restricted inside the app.",
    badge: "Strict",
  },
  {
    id: "admin-approval",
    label: "Require admin approval",
    description: "External storage access requires admin permission.",
    badge: "Admin",
  },
];

export function securityOptionLabel(
  options: SecurityOption[],
  id: string,
  fallback: string,
): string {
  return options.find((option) => option.id === id)?.label ?? fallback;
}
