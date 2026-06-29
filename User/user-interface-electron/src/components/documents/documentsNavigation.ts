import type { SearchFileTypeFilter } from "../search/searchTypes";
import { formatFolderLabel } from "../search/searchFolders";
import { listFolderAncestorIds } from "./documentsPageData";

export type DocumentsLocationState = {
  searchQuery?: string;
  fileTypeFilter?: "all" | "pdf" | "png" | "jpg";
  folderId?: string;
  selectedDocumentId?: string;
  openCreateFolder?: boolean;
};

export function mapSearchFileTypeToDocuments(
  filter: SearchFileTypeFilter,
): DocumentsLocationState["fileTypeFilter"] {
  if (filter === "jpeg") return "jpg";
  if (filter === "all" || filter === "pdf" || filter === "png") return filter;
  return "all";
}

export function folderTagToDocumentsFolderId(tag: string): string {
  const normalizedTag = tag.trim().toLowerCase();
  if (!normalizedTag) return "all";

  if (normalizedTag.includes("invoice")) return "all";
  if (normalizedTag.includes("finance")) return "all";

  return "all";
}

export function documentsFolderAncestors(folderId: string): string[] {
  return listFolderAncestorIds(folderId);
}

export function folderPathToLabel(folderPath: string): string {
  return formatFolderLabel(folderPath);
}
