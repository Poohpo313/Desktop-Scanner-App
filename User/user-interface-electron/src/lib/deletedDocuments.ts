import type { SavedDocument, SavedDocumentFileType } from "./documents";
import { formatStorageSize } from "./documents";

export type DeletedDocument = {
  id: string;
  fileName: string;
  fileType: SavedDocumentFileType;
  originalFolder: string;
  originalSavePath: string;
  recycledSavePath?: string;
  deletedAt: string;
  fileSizeBytes: number;
  pages: number;
  sourceDocument: SavedDocument;
};

export function formatDeletedDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((dayStart - targetStart) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatFileTypeLabel(fileType: SavedDocumentFileType): string {
  if (fileType === "PDF") return "PDF Document";
  if (fileType === "PNG") return "Image File";
  return "Image File";
}

export function formatFileSize(bytes: number): string {
  return formatStorageSize(bytes);
}

export function buildDeletedDocument(
  doc: SavedDocument,
  originalFolder: string,
  recycledSavePath?: string,
): DeletedDocument {
  return {
    id: `deleted-${doc.id}-${Date.now()}`,
    fileName: doc.fileName,
    fileType: doc.fileType,
    originalFolder,
    originalSavePath: doc.savePath,
    recycledSavePath,
    deletedAt: new Date().toISOString(),
    fileSizeBytes: doc.fileSizeBytes,
    pages: doc.pages,
    sourceDocument: doc,
  };
}
