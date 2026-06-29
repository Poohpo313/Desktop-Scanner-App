export type StorageOption = {
  id: string;
  label: string;
  description: string;
  badge?: string;
};

export const STORAGE_FOLDER_ORGANIZATION_MODAL_OPTIONS: StorageOption[] = [
  {
    id: "by-date",
    label: "By Date (YYYY-MM-DD)",
    description: "Organize scans into dated subfolders for easier retrieval.",
  },
  {
    id: "by-department",
    label: "By Department",
    description: "Group files by department folders such as Finance or HR.",
  },
  {
    id: "flat",
    label: "Flat folder",
    description: "Save all scans in one folder without extra subfolders.",
  },
];

export const STORAGE_RETENTION_OPTIONS: StorageOption[] = [
  {
    id: "30",
    label: "30 days",
    description: "Remove older temporary and archived files after one month.",
  },
  {
    id: "90",
    label: "90 days",
    description: "Recommended balance between disk space and record retention.",
    badge: "Recommended",
  },
  {
    id: "180",
    label: "180 days",
    description: "Keep archived scans available for half a year.",
  },
  {
    id: "365",
    label: "1 year",
    description: "Retain archived scans for annual compliance review.",
  },
  {
    id: "never",
    label: "Never delete automatically",
    description: "Files stay on disk until removed manually by an administrator.",
    badge: "Manual",
  },
];

export const STORAGE_EXTERNAL_BACKUP_OPTIONS: StorageOption[] = [
  {
    id: "disabled",
    label: "Disabled",
    description: "Scanned files are not copied to an external backup location.",
  },
  {
    id: "local-drive",
    label: "Local drive backup",
    description: "Copy completed scans to a secondary folder on this computer.",
  },
  {
    id: "network-share",
    label: "Network share",
    description: "Mirror scans to a shared network folder when available.",
  },
  {
    id: "cloud-mirror",
    label: "Cloud mirror",
    description: "Keep an online backup copy when Cloud Sync is enabled.",
    badge: "Optional",
  },
  {
    id: "admin-only",
    label: "Require admin approval",
    description: "External backup changes must be approved by an administrator.",
    badge: "Admin",
  },
];

export function storageOptionLabel(
  options: StorageOption[],
  id: string,
  fallback: string,
): string {
  return options.find((option) => option.id === id)?.label ?? fallback;
}

export function truncateStoragePath(path: string, maxLength = 34): string {
  if (path.length <= maxLength) return path;
  return `…${path.slice(-(maxLength - 1))}`;
}
