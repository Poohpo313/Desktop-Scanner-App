import type { OfflineScanConfig } from "../components/scan/offline/scanOfflineData";
import type { AppSettings } from "../components/settings/settingsData";
import type { SavedDocument } from "./documents";
import {
  getDocumentsStorageRoot,
  getLastSaveDirectory,
  resolveDepartmentSaveDirectory,
} from "./documentStorageConfig";
import {
  isAutoSaveEnabled,
  usesMultipleLocalFolders,
} from "./savePreferencesHelpers";

export type SavePlan = {
  fileName: string;
  directories: string[];
  cloudSync: boolean;
  addToRecords: boolean;
  askFolder: boolean;
  description: string;
};

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.\\]+$/, "");
}

export function resolveUniqueFileName(
  fileName: string,
  existingDocuments: SavedDocument[],
  targetDirectories: string[],
): string {
  const normalizedDirs = targetDirectories.map((dir) => dir.toLowerCase());
  const baseName = stripExtension(fileName);
  const extensionMatch = fileName.match(/(\.[^.\\]+)$/);
  const extension = extensionMatch?.[1] ?? "";

  const conflicts = existingDocuments.filter((doc) => {
    const folder = doc.savePath.replace(/[/\\][^/\\]+$/, "").toLowerCase();
    const sameFolder = normalizedDirs.some(
      (dir) => folder === dir || folder.startsWith(`${dir}\\`) || dir.startsWith(`${folder}\\`),
    );
    return sameFolder && stripExtension(doc.fileName).toLowerCase() === baseName.toLowerCase();
  });

  if (conflicts.length === 0) return fileName;

  let counter = 1;
  while (counter < 1000) {
    const candidate = `${baseName} (${counter})${extension}`;
    const taken = existingDocuments.some((doc) => doc.fileName.toLowerCase() === candidate.toLowerCase());
    if (!taken) return candidate;
    counter += 1;
  }

  return `${baseName} (${Date.now()})${extension}`;
}

export function buildSavePlan(
  settings: AppSettings,
  config: OfflineScanConfig,
  documents: SavedDocument[],
  options: {
    isOnline: boolean;
    manualFolder?: string | null;
    userId?: number | null;
    proposedFileName?: string | null;
  } = {
    isOnline: false,
  },
): SavePlan {
  const departmentLabel = config.customDepartmentLabel || config.departmentId;
  const userId = options.userId ?? null;
  const defaultDirectory = resolveDepartmentSaveDirectory(
    settings,
    config.departmentId,
    departmentLabel,
    userId,
  );
  const manualFolder = options.manualFolder?.trim();
  const lastDirectory = getLastSaveDirectory(userId);
  const root = getDocumentsStorageRoot(userId);

  let directories: string[] = [];
  let askFolder = settings.saveMode === "ask-every-time";
  let description = "Saved to your documents folder.";

  if (askFolder) {
    directories = [manualFolder || config.savePath.trim() || lastDirectory || defaultDirectory];
    description = manualFolder
      ? `Will save to ${manualFolder}.`
      : "Choose a folder before saving.";
  } else if (usesMultipleLocalFolders(settings.saveMode)) {
    directories = [
      settings.primaryFolder?.trim() || defaultDirectory,
      settings.secondaryFolder?.trim() || `${root}\\Backup`,
    ].filter(Boolean);
    description = "Saved to primary and backup folders.";
  } else {
    directories = [config.savePath.trim() || defaultDirectory];
    description = `Saved to ${directories[0]}.`;
  }

  let fileName = options.proposedFileName?.trim() ?? "";

  if (!/\.[a-z0-9]+$/i.test(fileName)) {
    const ext = settings.defaultFileType?.toLowerCase() || config.fileFormat || "pdf";
    fileName = `${fileName}.${ext}`;
  }

  fileName = resolveUniqueFileName(fileName, documents, directories);

  const cloudSync =
    settings.saveMode === "local-cloud-sync"
      ? settings.cloudSync && options.isOnline
      : settings.cloudSync && options.isOnline;

  return {
    fileName,
    directories,
    cloudSync,
    addToRecords: isAutoSaveEnabled(settings.saveMode) || !options.isOnline || true,
    askFolder,
    description,
  };
}
