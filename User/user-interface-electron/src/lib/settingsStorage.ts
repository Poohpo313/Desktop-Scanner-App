import { APP_STORAGE_KEYS } from "../config/appStorage";
import { DEFAULT_SCANNED_DOCUMENTS_ROOT, LEGACY_PLACEHOLDER_SAVE_PATH } from "../components/search/searchFolders";
import { DEFAULT_APP_SETTINGS, type AppSettings } from "../components/settings/settingsData";
import { normalizeAppSettings } from "./settingsScanHelpers";

const LEGACY_PLACEHOLDER_PATH = LEGACY_PLACEHOLDER_SAVE_PATH;

function usesLegacyStoragePath(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return true;
  return trimmed === LEGACY_PLACEHOLDER_PATH || trimmed === DEFAULT_SCANNED_DOCUMENTS_ROOT;
}

function migrateLegacySettings(settings: AppSettings): AppSettings {
  if (
    !usesLegacyStoragePath(settings.primaryFolder) &&
    !usesLegacyStoragePath(settings.storageRoot) &&
    !usesLegacyStoragePath(settings.storageDefaultSaveLocation)
  ) {
    return settings;
  }

  const root =
    settings.storageRoot?.trim() && !usesLegacyStoragePath(settings.storageRoot)
      ? settings.storageRoot.trim()
      : settings.primaryFolder?.trim() && !usesLegacyStoragePath(settings.primaryFolder)
        ? settings.primaryFolder.trim()
        : DEFAULT_SCANNED_DOCUMENTS_ROOT;

  return {
    ...settings,
    primaryFolder: usesLegacyStoragePath(settings.primaryFolder) ? root : settings.primaryFolder,
    storageRoot: usesLegacyStoragePath(settings.storageRoot) ? root : settings.storageRoot,
    storageDefaultSaveLocation: usesLegacyStoragePath(settings.storageDefaultSaveLocation)
      ? root
      : settings.storageDefaultSaveLocation,
    defaultSaveLocation: usesLegacyStoragePath(settings.defaultSaveLocation)
      ? root
      : settings.defaultSaveLocation,
  };
}

export function loadStoredSettings(userId: number): AppSettings | null {
  try {
    const raw = localStorage.getItem(`${APP_STORAGE_KEYS.settings}-${userId}`);
    if (!raw) return null;
    return migrateLegacySettings({ ...DEFAULT_APP_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) });
  } catch {
    return null;
  }
}

export const SETTINGS_UPDATED_EVENT = "bukolabs-settings-updated";

export function persistSettings(userId: number, settings: AppSettings) {
  localStorage.setItem(`${APP_STORAGE_KEYS.settings}-${userId}`, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: { userId } }));
}

export function resolveSettings(userId: number | null): AppSettings {
  if (userId != null) {
    return normalizeAppSettings(loadStoredSettings(userId) ?? { ...DEFAULT_APP_SETTINGS });
  }
  return normalizeAppSettings({ ...DEFAULT_APP_SETTINGS });
}
