import { formatDocumentDate } from "../../lib/documents";
import { formatFolderLabel, matchesFolderPath, type SearchFolderOption } from "./searchFolders";
import {
  DEFAULT_SEARCH_FILTERS,
  type SearchDateFilter,
  type SearchFileTypeFilter,
  type SearchFilters,
  type SearchResult,
} from "./searchTypes";

export type HighlightSegment = {
  text: string;
  highlight: boolean;
};

export function fileTypeFilterLabel(value: SearchFileTypeFilter): string {
  if (value === "all") return "All";
  if (value === "pdf") return "PDF";
  if (value === "png") return "PNG";
  return "JPEG";
}

export function dateFilterLabel(value: SearchDateFilter): string {
  if (value === "any") return "Any time";
  if (value === "7") return "Last 7 days";
  if (value === "30") return "Last 30 days";
  if (value === "90") return "Last 90 days";
  return "Last year";
}

export function folderFilterLabel(folder: string, folderOptions: SearchFolderOption[]): string {
  if (folder === "all") return "All";
  const match = folderOptions.find((item) => item.path === folder);
  return match?.label ?? formatFolderLabel(folder);
}

export function tagsFilterLabel(value: string): string {
  return value === "all" ? "All" : value;
}

export function filterSummary(filters: SearchFilters, folderOptions: SearchFolderOption[]) {
  return {
    fileType: fileTypeFilterLabel(filters.fileType),
    date: dateFilterLabel(filters.date),
    folder: folderFilterLabel(filters.folder, folderOptions),
    tags: tagsFilterLabel(filters.tags),
  };
}

function matchesFileType(fileType: SearchResult["fileType"], filter: SearchFileTypeFilter): boolean {
  if (filter === "all") return true;
  if (filter === "pdf") return fileType === "PDF";
  if (filter === "png") return fileType === "PNG";
  return fileType === "JPG";
}

function matchesDate(modifiedAt: string, filter: SearchDateFilter): boolean {
  if (filter === "any") return true;
  const days = Number(filter);
  const modified = new Date(modifiedAt).getTime();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return modified >= cutoff;
}

function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function parseSearchQuery(query: string) {
  const required: string[] = [];
  const excluded: string[] = [];
  const phrases: string[] = [];

  const phraseMatches = query.match(/"([^"]+)"/g) ?? [];
  let remainder = query;
  for (const phrase of phraseMatches) {
    phrases.push(phrase.slice(1, -1).toLowerCase());
    remainder = remainder.replace(phrase, " ");
  }

  for (const token of tokenizeQuery(remainder)) {
    if (token.startsWith("-") && token.length > 1) {
      excluded.push(token.slice(1));
    } else {
      required.push(token);
    }
  }

  return { required, excluded, phrases };
}

export function getHighlightTerms(query: string): string[] {
  const parsed = parseSearchQuery(query);
  return [...parsed.phrases, ...parsed.required.filter((term) => !term.includes("*"))].filter(Boolean);
}

function wildcardMatch(text: string, pattern: string): boolean {
  if (!pattern.includes("*")) return text.includes(pattern);
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(escaped, "i").test(text);
}

function matchesQuery(item: SearchResult, rawQuery: string): boolean {
  const query = rawQuery.trim();
  if (!query) return true;

  const haystack =
    `${item.fileName} ${item.department} ${item.ocrText ?? ""} ${item.snippet} ${item.tags.join(" ")}`.toLowerCase();
  const { required, excluded, phrases } = parseSearchQuery(query);

  if (phrases.some((phrase) => !haystack.includes(phrase))) return false;
  if (excluded.some((term) => haystack.includes(term))) return false;
  if (required.length === 0) return true;

  return required.every((term) => wildcardMatch(haystack, term));
}

export function filterSearchResults(
  catalog: SearchResult[],
  query: string,
  filters: SearchFilters = DEFAULT_SEARCH_FILTERS,
): SearchResult[] {
  return catalog.filter((item) => {
    if (!matchesFileType(item.fileType, filters.fileType)) return false;
    if (!matchesDate(item.modifiedAt, filters.date)) return false;
    if (filters.folder !== "all" && !matchesFolderPath(item.savePath, filters.folder)) return false;
    if (filters.tags !== "all" && !item.tags.includes(filters.tags)) return false;
    if (filters.ocrContains.trim()) {
      const ocr = filters.ocrContains.trim().toLowerCase();
      const haystack = `${item.ocrText ?? ""} ${item.snippet}`.toLowerCase();
      if (!haystack.includes(ocr)) return false;
    }
    if (!matchesQuery(item, query)) return false;
    return true;
  });
}

export function formatResultMeta(item: SearchResult): string {
  return `${item.department} • ${item.pages} ${item.pages === 1 ? "page" : "pages"} • ${formatDocumentDate(item.modifiedAt)}`;
}

export function buildSnippetAroundMatch(text: string, query: string, radius = 72): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (!query.trim()) return trimmed.slice(0, 180);

  const lower = trimmed.toLowerCase();
  for (const term of getHighlightTerms(query)) {
    const index = lower.indexOf(term.toLowerCase());
    if (index >= 0) {
      const start = Math.max(0, index - radius);
      const end = Math.min(trimmed.length, index + term.length + radius);
      return trimmed.slice(start, end);
    }
  }

  return trimmed.slice(0, 180);
}

export function splitHighlightedText(text: string, query: string): HighlightSegment[] {
  const terms = getHighlightTerms(query);
  if (terms.length === 0 || !text) {
    return [{ text, highlight: false }];
  }

  const pattern = terms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const parts = text.split(new RegExp(`(${pattern})`, "gi"));
  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlight: terms.some((term) => part.toLowerCase() === term.toLowerCase()),
    }));
}

export function highlightSnippet(
  snippet: string,
  query: string,
  _tags: string[] = [],
): HighlightSegment[] {
  return splitHighlightedText(snippet, query);
}
