import type { SavedDocument } from "./documents";
import { fileTypeFromFormat } from "./documents";

export type FilesystemDocumentEntry = {
  name: string;
  path: string;
  size: number;
  modifiedAt: string;
};

function inferDepartmentFromPath(savePath: string): { departmentId: string; department: string } {
  const parts = savePath.split(/[/\\]/).filter(Boolean);
  const folder = parts.length >= 2 ? parts[parts.length - 2] : "Documents";
  const slug = folder.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return { departmentId: slug || "documents", department: folder };
}

function extensionToFormat(name: string): "pdf" | "png" | "jpeg" {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "jpg" || ext === "jpeg") return "jpeg";
  return "pdf";
}

export function mergeFilesystemDocuments(
  existing: SavedDocument[],
  files: FilesystemDocumentEntry[],
  storageRoot: string,
): SavedDocument[] {
  const normalizedRoot = storageRoot.trim().toLowerCase();
  const byPath = new Map(existing.map((doc) => [doc.savePath.toLowerCase(), doc]));
  const seenPaths = new Set<string>();
  const merged: SavedDocument[] = [];

  for (const file of files) {
    const key = file.path.toLowerCase();
    if (!key.startsWith(normalizedRoot)) continue;
    seenPaths.add(key);

    const current = byPath.get(key);
    if (current) {
      merged.push({
        ...current,
        fileName: file.name,
        fileSizeBytes: file.size,
        modifiedAt: file.modifiedAt,
      });
      continue;
    }

    const { departmentId, department } = inferDepartmentFromPath(file.path);
    merged.push({
      id: `doc-fs-${key.replace(/[^a-z0-9]+/gi, "-")}`,
      fileName: file.name,
      pages: 1,
      department,
      departmentId,
      modifiedAt: file.modifiedAt,
      fileType: fileTypeFromFormat(extensionToFormat(file.name)),
      savePath: file.path,
      fileSizeBytes: file.size,
      cloudSync: false,
    });
  }

  return merged.sort(
    (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
  );
}
