import type { SavedDocumentFileType } from "../../lib/documents";

export type SearchFileTypeFilter = "all" | "pdf" | "png" | "jpeg";

export type SearchDateFilter = "any" | "7" | "30" | "90" | "365";

export type SearchFilters = {
  fileType: SearchFileTypeFilter;
  date: SearchDateFilter;
  folder: string;
  tags: string;
  ocrContains: string;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  fileType: "all",
  date: "any",
  folder: "all",
  tags: "all",
  ocrContains: "",
};

export type SearchResult = {
  id: string;
  fileName: string;
  fileType: SavedDocumentFileType;
  pages: number;
  department: string;
  departmentId: string;
  modifiedAt: string;
  snippet: string;
  ocrText?: string;
  tags: string[];
  savePath: string;
};
