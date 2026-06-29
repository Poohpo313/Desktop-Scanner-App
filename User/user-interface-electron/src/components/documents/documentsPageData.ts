import type { SavedDocument } from "../../lib/documents";
import { getDocumentSearchHaystack } from "../../lib/documentSearchText";
import type { DeletedDocument } from "../../lib/deletedDocuments";
import { formatFolderLabel, getDocumentFolderPath, matchesFolderPath } from "../search/searchFolders";

export type FolderNode = {
  id: string;
  label: string;
  description?: string;
  children?: FolderNode[];
};

export function slugifyFolderName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveFolderDiskPath(
  folderId: string,
  storageRoot: string,
  customFolders: FolderNode[] = [],
): string {
  const root = normalizePath(storageRoot);
  if (folderId === "all" || folderId === RECYCLE_BIN_FOLDER_ID) return root;

  if (folderId.startsWith("custom/")) {
    const custom = customFolders.find((folder) => folder.id === folderId);
    return custom?.label ? `${root}\\${custom.label}` : root;
  }

  if (/[:\\]/.test(folderId)) {
    return normalizePath(folderId);
  }

  return root;
}

export function isSelectableFolderId(folderId: string): boolean {
  return folderId !== "all" && folderId !== RECYCLE_BIN_FOLDER_ID;
}

export function isStorageRootPath(folderPath: string, storageRoot: string): boolean {
  return normalizePath(folderPath).toLowerCase() === normalizePath(storageRoot).toLowerCase();
}

export const RECYCLE_BIN_FOLDER_ID = "recycle-bin";

function normalizePath(path: string): string {
  return path.trim().replace(/\//g, "\\").replace(/\\+$/, "");
}

function getParentPath(path: string): string | null {
  const normalized = normalizePath(path);
  const index = normalized.lastIndexOf("\\");
  if (index <= 0) return null;
  return normalized.slice(0, index);
}

function collectDocumentFolderPaths(documents: SavedDocument[]): string[] {
  const paths = new Set<string>();

  for (const doc of documents) {
    let current = normalizePath(getDocumentFolderPath(doc.savePath));
    while (current) {
      paths.add(current);
      const parent = getParentPath(current);
      if (!parent || parent === current) break;
      current = parent;
    }
  }

  return [...paths].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function longestCommonPrefixPath(paths: string[]): string {
  if (paths.length === 0) return "";

  const splitPaths = paths.map((path) => normalizePath(path).split("\\").filter(Boolean));
  const minLength = Math.min(...splitPaths.map((parts) => parts.length));
  const common: string[] = [];

  for (let index = 0; index < minLength; index += 1) {
    const segment = splitPaths[0][index];
    if (splitPaths.every((parts) => parts[index].toLowerCase() === segment.toLowerCase())) {
      common.push(segment);
    } else {
      break;
    }
  }

  return common.join("\\");
}

function resolveFolderTreeRoot(folderPaths: string[]): string {
  if (folderPaths.length === 0) return "";
  return longestCommonPrefixPath(folderPaths);
}

function buildPathFolderTree(folderPaths: string[], rootPrefix: string): FolderNode[] {
  const nodeMap = new Map<string, FolderNode>();

  for (const folderPath of folderPaths) {
    const normalized = normalizePath(folderPath);
    if (!normalized.toLowerCase().startsWith(rootPrefix.toLowerCase())) continue;

    const relative = normalized.slice(rootPrefix.length).replace(/^\\+/, "");
    if (!relative) continue;

    let currentPath = rootPrefix;
    for (const segment of relative.split("\\").filter(Boolean)) {
      currentPath = `${currentPath}\\${segment}`;
      if (!nodeMap.has(currentPath)) {
        nodeMap.set(currentPath, {
          id: currentPath,
          label: segment,
          children: [],
        });
      }
    }
  }

  const roots: FolderNode[] = [];

  for (const node of nodeMap.values()) {
    const parentPath = getParentPath(node.id);
    if (parentPath && parentPath !== rootPrefix && nodeMap.has(parentPath)) {
      const parent = nodeMap.get(parentPath)!;
      parent.children = parent.children ?? [];
      if (!parent.children.some((child) => child.id === node.id)) {
        parent.children.push(node);
      }
      continue;
    }

    if (!roots.some((root) => root.id === node.id)) {
      roots.push(node);
    }
  }

  function sortTree(items: FolderNode[]): FolderNode[] {
    return items
      .map((item) => ({
        ...item,
        children: item.children?.length ? sortTree(item.children) : undefined,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }

  return sortTree(roots);
}

export function buildDocumentFolderTree(
  documents: SavedDocument[],
  customFolders: FolderNode[] = [],
  storageRoot?: string,
  storageFolderPaths: string[] = [],
): FolderNode[] {
  const docPaths = collectDocumentFolderPaths(documents);
  const extraPaths = storageFolderPaths.map((folderPath) => normalizePath(folderPath)).filter(Boolean);
  const rootPath = storageRoot?.trim() ? normalizePath(storageRoot) : "";
  const folderPaths = [...new Set([...(rootPath ? [rootPath] : []), ...docPaths, ...extraPaths])];
  const rootPrefix = storageRoot?.trim()
    ? normalizePath(storageRoot)
    : resolveFolderTreeRoot(folderPaths);
  const localFolders = rootPrefix ? buildPathFolderTree(folderPaths, rootPrefix) : [];

  return [
    {
      id: "all",
      label: "All Documents",
      children: [...localFolders, ...customFolders],
    },
  ];
}

export function filterActiveDocuments(
  documents: SavedDocument[],
  folderId: string,
  storageRoot?: string,
): SavedDocument[] {
  const inStorage = storageRoot?.trim()
    ? documents.filter((doc) =>
        normalizePath(doc.savePath)
          .toLowerCase()
          .startsWith(normalizePath(storageRoot).toLowerCase()),
      )
    : documents;

  if (folderId === "all") {
    if (!storageRoot?.trim()) return inStorage;
    const root = normalizePath(storageRoot);
    return inStorage.filter(
      (doc) => normalizePath(getDocumentFolderPath(doc.savePath)).toLowerCase() === root.toLowerCase(),
    );
  }
  if (folderId.startsWith("custom/")) {
    return inStorage.filter((doc) => doc.folderId === folderId);
  }

  return inStorage.filter((doc) => matchesFolderPath(doc.savePath, folderId));
}

export function filterDeletedDocuments(
  documents: DeletedDocument[],
  query: string,
  fileType: string,
  deletedDate: string,
): DeletedDocument[] {
  const normalized = query.trim().toLowerCase();

  return documents.filter((doc) => {
    if (fileType !== "all" && doc.fileType.toLowerCase() !== fileType.toLowerCase()) {
      return false;
    }

    if (deletedDate !== "all") {
      const deleted = new Date(doc.deletedAt).getTime();
      const days = Number(deletedDate);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      if (deleted < cutoff) return false;
    }

    if (!normalized) return true;

    const haystack = `${doc.fileName} ${doc.originalFolder} ${doc.originalSavePath}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export function filterActiveDocumentsBySearch(
  documents: SavedDocument[],
  query: string,
  fileType: string,
): SavedDocument[] {
  const normalized = query.trim().toLowerCase();

  return documents.filter((doc) => {
    if (fileType !== "all" && doc.fileType.toLowerCase() !== fileType.toLowerCase()) {
      return false;
    }
    if (!normalized) return true;
    return getDocumentSearchHaystack(doc).includes(normalized);
  });
}

export function getFolderBreadcrumb(
  folderId: string,
  documents: SavedDocument[] = [],
  customFolders: FolderNode[] = [],
): string[] {
  if (folderId === RECYCLE_BIN_FOLDER_ID) return ["Documents", "Recycle Bin"];
  if (folderId === "all") return ["Documents", "All Documents"];

  const tree = buildDocumentFolderTree(documents, customFolders);

  function findPath(nodes: FolderNode[], trail: string[]): string[] | null {
    for (const node of nodes) {
      const nextTrail = [...trail, node.label];
      if (node.id === folderId) return ["Documents", ...nextTrail];
      if (node.children) {
        const found = findPath(node.children, nextTrail);
        if (found) return found;
      }
    }
    return null;
  }

  const matched = findPath(tree, []);
  if (matched) return matched;

  if (folderId.startsWith("custom/")) {
    const label = findFolderLabel(folderId, documents, customFolders);
    return ["Documents", "All Documents", label];
  }

  const segments = normalizePath(folderId).split("\\").filter(Boolean);
  return ["Documents", "All Documents", ...segments.slice(-2)];
}

export function findFolderLabel(
  folderId: string,
  documents: SavedDocument[] = [],
  customFolders: FolderNode[] = [],
): string {
  if (folderId === RECYCLE_BIN_FOLDER_ID) return "Recycle Bin";
  if (folderId === "all") return "All Documents";

  const tree = buildDocumentFolderTree(documents, customFolders);

  function walk(nodes: FolderNode[]): string | null {
    for (const node of nodes) {
      if (node.id === folderId) return node.label;
      if (node.children) {
        const found = walk(node.children);
        if (found) return found;
      }
    }
    return null;
  }

  return walk(tree) ?? formatFolderLabel(folderId);
}

export function listFolderAncestorIds(folderId: string): string[] {
  if (folderId === "all" || folderId === RECYCLE_BIN_FOLDER_ID || folderId.startsWith("custom/")) {
    return folderId === "all" ? ["all"] : ["all", folderId];
  }

  const ancestors = ["all"];
  let current = normalizePath(folderId);

  while (current) {
    ancestors.push(current);
    const parent = getParentPath(current);
    if (!parent || parent === current) break;
    current = parent;
  }

  return ancestors;
}
