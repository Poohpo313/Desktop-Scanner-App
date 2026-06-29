import {
  getDefaultStorageRootCache,
  resolveDefaultStorageRootFallback,
  setDefaultStorageRootCache,
} from "../components/search/searchFolders";
import type { AppSettings } from "../components/settings/settingsData";
import { APP_STORAGE_KEYS } from "../config/appStorage";
import { resolveSettings } from "./settingsStorage";

const LAST_DIRECTORY_PREFIX = "bukolabs-last-save-directory";

export { setDefaultStorageRootCache, getDefaultStorageRootCache };

export function getDefaultSaveLocationDisplay(settings: AppSettings): string {
  return (
    settings.storageRoot?.trim() ||
    settings.primaryFolder?.trim() ||
    settings.defaultSaveLocation?.trim() ||
    getDefaultStorageRootCache() ||
    resolveDefaultStorageRootFallback()
  );
}

export function getDocumentsStorageRoot(userId: number | null): string {
  const configured = getDefaultSaveLocationDisplay(resolveSettings(userId)).trim();
  if (configured && isAbsoluteWindowsPath(configured)) {
    return configured;
  }
  return getDefaultStorageRootCache() ?? resolveDefaultStorageRootFallback();
}

export function defaultSaveLocationPatch(path: string): Pick<
  AppSettings,
  "storageRoot" | "primaryFolder" | "storageDefaultSaveLocation" | "defaultSaveLocation"
> {
  return {
    storageRoot: path,
    primaryFolder: path,
    storageDefaultSaveLocation: path,
    defaultSaveLocation: path,
  };
}

export function getLastSaveDirectory(userId: number | null): string | null {
  if (userId == null) return null;
  try {
    const value = localStorage.getItem(`${LAST_DIRECTORY_PREFIX}-${userId}`);
    return value?.trim() || null;
  } catch {
    return null;
  }
}

export function setLastSaveDirectory(userId: number | null, directory: string) {
  if (userId == null) return;
  const trimmed = directory.trim();
  if (!trimmed) return;
  localStorage.setItem(`${LAST_DIRECTORY_PREFIX}-${userId}`, trimmed);
}

function departmentSegment(rule: string): string {
  return rule.split("->")[1]?.trim() || "Documents";
}

export function resolveDepartmentSaveDirectory(
  settings: AppSettings,
  departmentId: string,
  departmentLabel: string,
  userId: number | null = null,
): string {
  const root = getDocumentsStorageRoot(userId);
  const primary = settings.primaryFolder?.trim() || root;
  const last = getLastSaveDirectory(userId);

  if (settings.storageFolderOrganizationId === "flat") {
    return primary;
  }

  if (settings.storageFolderOrganizationId === "by-date") {
    const stamp = new Date().toISOString().slice(0, 10);
    return `${primary}\\${stamp}`;
  }

  const folderName = departmentLabel || departmentSegment(settings.departmentRule) || departmentId;
  const base = last && last.toLowerCase().startsWith(primary.toLowerCase()) ? last : primary;
  return `${base}\\${folderName}`;
}

export function isAbsoluteWindowsPath(path: string): boolean {
  const trimmed = path.trim();
  return /^[a-zA-Z]:[\\/]/.test(trimmed) || trimmed.startsWith("\\\\");
}

export function resolveAbsoluteStoragePath(path: string, storageRoot: string): string {
  const trimmed = path.trim();
  const root = storageRoot.trim() || resolveDefaultStorageRootFallback();
  if (!trimmed) return root;
  if (isAbsoluteWindowsPath(trimmed)) return trimmed;

  const documentsParent = root.replace(/[/\\][^/\\]+$/, "");
  if (/^Documents[/\\]/i.test(trimmed)) {
    const subpath = trimmed.replace(/^Documents[/\\]/i, "");
    return subpath ? `${documentsParent}\\${subpath}` : documentsParent;
  }

  return `${root}\\${trimmed.replace(/^[/\\]+/, "")}`;
}

export function resolveSaveDirectories(paths: string[], storageRoot: string): string[] {
  return paths.map((entry) => resolveAbsoluteStoragePath(entry, storageRoot));
}

export function rememberSaveDirectory(userId: number | null, filePath: string) {
  const folder = filePath.replace(/[/\\][^/\\]+$/, "");
  if (folder) setLastSaveDirectory(userId, folder);
}

export function settingsStorageKey(userId: number) {
  return `${APP_STORAGE_KEYS.settings}-${userId}`;
}
