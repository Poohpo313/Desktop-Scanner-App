export type SearchFolderOption = {
  id: string;
  label: string;
  path: string;
};

export const DEFAULT_STORAGE_FOLDER_NAME = "Desktop Scanner Documents";
export const LEGACY_SCANNED_DOCUMENTS_ROOT = "C:\\Scanned Documents";
export const LEGACY_PLACEHOLDER_SAVE_PATH = "C:\\Users\\John\\Documents\\Desktop Scanner";

export const DEFAULT_SCANNED_DOCUMENTS_ROOT = LEGACY_SCANNED_DOCUMENTS_ROOT;

let defaultStorageRootCache: string | null = null;

export function setDefaultStorageRootCache(path: string) {
  defaultStorageRootCache = path.trim() || null;
}

export function getDefaultStorageRootCache(): string | null {
  return defaultStorageRootCache;
}

export function resolveDefaultStorageRootFallback(): string {
  return defaultStorageRootCache ?? LEGACY_SCANNED_DOCUMENTS_ROOT;
}

export function formatFolderLabel(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "Folder";
  const parts = trimmed.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] ?? trimmed;
}

export function getDocumentFolderPath(savePath: string): string {
  const trimmed = savePath.trim();
  if (!trimmed) return "";
  const index = Math.max(trimmed.lastIndexOf("\\"), trimmed.lastIndexOf("/"));
  if (index <= 0) return trimmed;
  return trimmed.slice(0, index);
}

export function matchesFolderPath(savePath: string, folderPath: string): boolean {
  if (folderPath === "all") return true;
  const save = savePath.trim().toLowerCase();
  const folder = folderPath.trim().toLowerCase();
  if (!save || !folder) return false;
  return save === folder || save.startsWith(`${folder}\\`) || save.startsWith(`${folder}/`);
}

export function demoDocumentSavePath(departmentId: string, fileName: string): string {
  return `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\${departmentId}\\${fileName}`;
}
