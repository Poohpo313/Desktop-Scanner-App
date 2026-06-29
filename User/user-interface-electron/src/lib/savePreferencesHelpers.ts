import {
  SAVE_MODE_OPTIONS,
  type AppSettings,
  type SaveModeId,
} from "../components/settings/settingsData";
import type { SavedDocument } from "./documents";

export type SavePreviewContext = {
  documents?: SavedDocument[];
  pendingDocument?: Pick<SavedDocument, "fileName" | "savePath" | "department" | "departmentId"> | null;
};

export function saveModeLabel(mode: SaveModeId): string {
  return SAVE_MODE_OPTIONS.find((option) => option.id === mode)?.title ?? "Auto-save to folder";
}

export function multipleSaveFoldersLabel(mode: SaveModeId): string {
  return mode === "multiple-folders" || mode === "local-cloud-sync" ? "Allowed" : "Not enabled";
}

export function saveModeStatusLabel(mode: SaveModeId): string {
  if (mode === "auto-save") return "Auto + optional multi-folder";
  if (mode === "ask-every-time") return "Ask every time";
  if (mode === "multiple-folders") return "Auto + multi-folder";
  return "Local + cloud sync";
}

export function syncSavePreferenceFields(settings: AppSettings): AppSettings {
  return {
    ...settings,
    defaultSaveLocation: settings.primaryFolder,
    defaultSaveMode: saveModeLabel(settings.saveMode),
    multipleSaveFolders: multipleSaveFoldersLabel(settings.saveMode),
    defaultFileType: settings.defaultFileType,
    scanFileFormat: settings.defaultFileType,
    storageDefaultSaveLocation: settings.primaryFolder,
  };
}

function departmentFromRule(rule: string): string {
  return rule.split("->")[0]?.trim() || "Finance";
}

function subfolderFromRule(rule: string): string {
  return rule.split("->")[1]?.trim() || "Invoices";
}

export function getMostRecentDocument(documents: SavedDocument[]): SavedDocument | null {
  if (documents.length === 0) return null;
  return [...documents].sort(
    (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
  )[0];
}

export function resolveSavePreviewDocument(context: SavePreviewContext = {}): SavedDocument | null {
  if (context.pendingDocument) {
    return {
      id: "pending-save-preview",
      pages: 1,
      modifiedAt: new Date().toISOString(),
      fileType: "PDF",
      fileSizeBytes: 0,
      cloudSync: false,
      ...context.pendingDocument,
    };
  }
  return getMostRecentDocument(context.documents ?? []);
}

function formatPreviewDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPreviewTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}-${minutes}`;
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.\\]+$/, "");
}

function extractDocumentLabel(fileName: string): string {
  const base = stripExtension(fileName);
  const firstPart = base.split("_")[0]?.trim();
  return firstPart || "Document";
}

function extractDocumentType(fileName: string, fallback: string): string {
  const base = stripExtension(fileName);
  const parts = base.split("_").filter(Boolean);
  if (parts.length >= 2) return parts[1];
  if (parts.length === 1) return parts[0];
  return fallback;
}

function folderPathFromSavePath(savePath: string): string {
  const normalized = savePath.replace(/\//g, "\\");
  const lastSlash = normalized.lastIndexOf("\\");
  if (lastSlash <= 0) return normalized;
  return normalized.slice(0, lastSlash);
}

function nextSaveCounter(
  documents: SavedDocument[],
  targetFolder: string,
  department: string,
  dateStamp: string,
): string {
  const folderKey = targetFolder.toLowerCase();
  const matches = documents.filter((doc) => {
    const folder = folderPathFromSavePath(doc.savePath).toLowerCase();
    const sameFolder = folder === folderKey || folder.startsWith(`${folderKey}\\`);
    const sameDepartment = doc.department.toLowerCase() === department.toLowerCase();
    const sameDay = doc.fileName.includes(dateStamp.replace(/-/g, "_")) ||
      doc.fileName.includes(dateStamp);
    return (sameFolder || sameDepartment) && sameDay;
  });

  return String(matches.length + 1).padStart(3, "0");
}

export function applySaveNamingPattern(
  settings: AppSettings,
  context: SavePreviewContext = {},
  referenceDate = new Date(),
): string {
  const sourceDocument = resolveSavePreviewDocument(context);
  const documents = context.documents ?? [];
  const department =
    sourceDocument?.department ?? departmentFromRule(settings.departmentRule);
  const subfolder = subfolderFromRule(settings.departmentRule);
  const documentLabel = sourceDocument
    ? extractDocumentLabel(sourceDocument.fileName)
    : department;
  const documentType = sourceDocument
    ? extractDocumentType(sourceDocument.fileName, subfolder)
    : subfolder;
  const targetFolder = sourceDocument
    ? folderPathFromSavePath(sourceDocument.savePath)
    : `${settings.primaryFolder}\\${subfolder}`;
  const dateStamp = formatPreviewDate(referenceDate);
  const timeStamp = formatPreviewTime(referenceDate);
  const counter = nextSaveCounter(documents, targetFolder, department, dateStamp);
  const extension = settings.defaultFileType.toLowerCase();

  let fileName = settings.saveNamingPattern
    .replace(/\{Department\}/g, department)
    .replace(/\{DocumentType\}/g, documentType)
    .replace(/\{Document\}/g, documentLabel)
    .replace(/\{Date\}/g, dateStamp)
    .replace(/\{Time\}/g, timeStamp)
    .replace(/\{Counter\}/g, counter);

  if (!/\.[a-z0-9]+$/i.test(fileName)) {
    fileName = `${fileName}.${extension}`;
  }

  return fileName;
}

export function buildSavePreviewFileName(
  settings: AppSettings,
  context: SavePreviewContext = {},
): string {
  if (context.pendingDocument?.fileName) {
    return context.pendingDocument.fileName;
  }
  return applySaveNamingPattern(settings, context);
}

export function buildSavePreviewPaths(
  settings: AppSettings,
  context: SavePreviewContext = {},
): string[] {
  const fileName = buildSavePreviewFileName(settings, context);
  const sourceDocument = resolveSavePreviewDocument(context);
  const department = sourceDocument?.department ?? departmentFromRule(settings.departmentRule);
  const subfolder = subfolderFromRule(settings.departmentRule);
  const recentFolder = sourceDocument ? folderPathFromSavePath(sourceDocument.savePath) : null;

  if (settings.saveMode === "ask-every-time") {
    const folderSegment = recentFolder
      ? recentFolder.split("\\").slice(-2).join("\\")
      : `${department}\\${subfolder}`;
    return [`Chosen Folder\\${folderSegment}\\${fileName}`];
  }

  const primaryPath = recentFolder
    ? `${recentFolder}\\${fileName}`
    : `${settings.primaryFolder}\\${subfolder}\\${fileName}`;

  if (settings.saveMode === "multiple-folders") {
    return [primaryPath, `${settings.secondaryFolder}\\${fileName}`];
  }

  if (settings.saveMode === "local-cloud-sync") {
    const paths = [primaryPath];
    if (settings.cloudSync) {
      paths.push(`Cloud Sync\\${department}\\${subfolder}\\${fileName}`);
    }
    return paths;
  }

  return [primaryPath];
}

export function buildSavePreviewDescription(
  settings: AppSettings,
  context: SavePreviewContext = {},
): string {
  const sourceDocument = resolveSavePreviewDocument(context);
  const basedOnRecent = sourceDocument ? ` (${sourceDocument.fileName})` : "";

  if (settings.saveMode === "ask-every-time") {
    return "The system will ask the user to choose a save location after each scan.";
  }

  if (settings.saveMode === "local-cloud-sync") {
    return `A local copy is saved automatically and a cloud copy syncs when you are signed in.${basedOnRecent}`;
  }

  if (settings.saveMode === "multiple-folders") {
    return `The next scanned file will be saved to both the primary and secondary folders below.${basedOnRecent}`;
  }

  if (sourceDocument) {
    if (context.pendingDocument) {
      return `The next scanned file will be saved using your current scan settings${basedOnRecent}.`;
    }
    return `The next scanned file will follow your naming pattern, based on your recent document${basedOnRecent}.`;
  }

  return "The next scanned file will be saved using your default folder and naming pattern.";
}

export function buildSavePreviewLocations(
  settings: AppSettings,
  context: SavePreviewContext = {},
): string {
  return buildSavePreviewPaths(settings, context).join("; ");
}

export function isAutoSaveEnabled(mode: SaveModeId): boolean {
  return mode === "auto-save" || mode === "multiple-folders" || mode === "local-cloud-sync";
}

export function usesMultipleLocalFolders(mode: SaveModeId): boolean {
  return mode === "multiple-folders";
}

export function saveMethodSummary(mode: SaveModeId): string {
  if (mode === "ask-every-time") return "Choose folder after each scan";
  if (mode === "local-cloud-sync") return "Save locally and sync to cloud";
  if (mode === "multiple-folders") return "Save to primary and secondary folders";
  return "Auto-save to default folder";
}

export function folderRuleSummary(mode: SaveModeId, departmentRule: string): string {
  if (mode === "ask-every-time") return "Applied after folder selection";
  if (mode === "local-cloud-sync") return "Local folder plus cloud destination";
  return departmentRule;
}

export function summaryTagsForSaveMode(settings: AppSettings): string[] {
  const { saveMode, folderTags, cloudSync } = settings;

  if (saveMode === "ask-every-time") {
    return ["Manual Save", "Ask Every Scan"];
  }

  if (saveMode === "local-cloud-sync") {
    return cloudSync ? ["Local Copy", "Cloud Sync"] : ["Local Copy", "Cloud Optional"];
  }

  if (saveMode === "multiple-folders") {
    return ["Invoices", "Finance Backup"];
  }

  return folderTags;
}

export function showsFolderRuleInSummary(mode: SaveModeId): boolean {
  return mode !== "multiple-folders";
}

export function showsAddFolderTag(mode: SaveModeId): boolean {
  return mode === "auto-save" || mode === "multiple-folders";
}

export function usesManualSavePreview(mode: SaveModeId): boolean {
  return mode === "ask-every-time";
}
