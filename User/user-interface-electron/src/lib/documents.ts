import type { OfflineScanConfig } from "../components/scan/offline/scanOfflineData";
import { resolveDepartmentLabel } from "../components/scan/offline/scanOfflineHelpers";

export type SavedDocumentFileType = "PDF" | "PNG" | "JPG";

export type SavedDocument = {
  id: string;
  fileName: string;
  pages: number;
  department: string;
  departmentId: string;
  folderId?: string;
  modifiedAt: string;
  fileType: SavedDocumentFileType;
  savePath: string;
  fileSizeBytes: number;
  cloudSync: boolean;
  notes?: string;
  ocrText?: string;
};

export type AddSavedDocumentInput = {
  fileName: string;
  pages?: number;
  departmentId: string;
  customDepartmentLabel?: string;
  folderId?: string;
  fileFormat: OfflineScanConfig["fileFormat"];
  savePath: string;
  cloudSync: boolean;
  notes?: string;
  ocrText?: string;
  fileSizeBytes?: number;
};

export function fileTypeFromFormat(format: OfflineScanConfig["fileFormat"]): SavedDocumentFileType {
  if (format === "jpeg") return "JPG";
  if (format === "png") return "PNG";
  return "PDF";
}

export function formatDocumentDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDocumentDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function buildSavedDocument(input: AddSavedDocumentInput): SavedDocument {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName: input.fileName.trim() || "Untitled_Scan.pdf",
    pages: input.pages ?? 1,
    departmentId: input.departmentId,
    department: resolveDepartmentLabel({
      departmentId: input.departmentId,
      customDepartmentLabel: input.customDepartmentLabel ?? "",
    }),
    folderId: input.folderId,
    modifiedAt: new Date().toISOString(),
    fileType: fileTypeFromFormat(input.fileFormat),
    savePath: input.savePath,
    fileSizeBytes: input.fileSizeBytes ?? Math.round(1.2 * 1024 * 1024),
    cloudSync: input.cloudSync,
    notes: input.notes?.trim() || undefined,
    ocrText: input.ocrText?.trim() || undefined,
  };
}
