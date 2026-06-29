import {
  defaultSaveLocationPatch,
  setDefaultStorageRootCache,
} from "./documentStorageConfig";
import { persistSettings, resolveSettings } from "./settingsStorage";
import {
  DEFAULT_STORAGE_FOLDER_NAME,
  LEGACY_SCANNED_DOCUMENTS_ROOT,
  LEGACY_PLACEHOLDER_SAVE_PATH,
} from "../components/search/searchFolders";

function usesLegacyStorageRoot(path: string | undefined): boolean {
  const trimmed = path?.trim() ?? "";
  if (!trimmed) return true;
  return trimmed === LEGACY_SCANNED_DOCUMENTS_ROOT || trimmed === LEGACY_PLACEHOLDER_SAVE_PATH;
}

export async function ensureUserStorageRoot(userId: number): Promise<string | null> {
  if (!window.bukolabs?.filesystem?.ensureDefaultStorageRoot) return null;

  const result = await window.bukolabs.filesystem.ensureDefaultStorageRoot();
  if (!result.success || !result.path) return null;

  setDefaultStorageRootCache(result.path);

  const settings = resolveSettings(userId);
  if (usesLegacyStorageRoot(settings.storageRoot) || usesLegacyStorageRoot(settings.primaryFolder)) {
    persistSettings(userId, {
      ...settings,
      ...defaultSaveLocationPatch(result.path),
    });
  }

  return result.path;
}

export { DEFAULT_STORAGE_FOLDER_NAME };
