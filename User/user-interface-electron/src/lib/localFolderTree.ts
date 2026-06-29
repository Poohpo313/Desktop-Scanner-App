import type { DirectoryEntry } from "../components/scan/offline/useLocalFilesystem";
import { DEFAULT_SCANNED_DOCUMENTS_ROOT, formatFolderLabel } from "../components/search/searchFolders";

const DEPARTMENT_SUBFOLDERS = ["Invoices", "Receipts", "Vouchers", "Reports", "Payroll"];

function departmentFolders(departmentPath: string): DirectoryEntry[] {
  return DEPARTMENT_SUBFOLDERS.map((name) => ({
    name,
    path: `${departmentPath}\\${name}`,
  }));
}

export const DEMO_FOLDER_TREE: Record<string, DirectoryEntry[]> = {
  "C:\\": [{ name: "Scanned Documents", path: DEFAULT_SCANNED_DOCUMENTS_ROOT }],
  [DEFAULT_SCANNED_DOCUMENTS_ROOT]: [
    { name: "Finance", path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance` },
    { name: "Human Resources", path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\hr` },
    { name: "Registrar", path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\registrar` },
    { name: "Admin Office", path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\admin` },
    { name: "Library", path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\library` },
  ],
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance`]: departmentFolders(
    `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance`,
  ),
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\hr`]: departmentFolders(`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\hr`),
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\registrar`]: departmentFolders(
    `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\registrar`,
  ),
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\admin`]: departmentFolders(
    `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\admin`,
  ),
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\library`]: departmentFolders(
    `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\library`,
  ),
  "C:\\Users\\Public\\Documents": [
    { name: "Scanned Documents", path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}` },
  ],
};

export function listDemoFolders(dirPath: string): DirectoryEntry[] {
  const normalized = dirPath.trim();
  return DEMO_FOLDER_TREE[normalized] ?? [];
}

export function getParentFolderPath(path: string): string | null {
  const normalized = path.trim();
  if (!normalized || normalized === DEFAULT_SCANNED_DOCUMENTS_ROOT) return null;

  const index = Math.max(normalized.lastIndexOf("\\"), normalized.lastIndexOf("/"));
  if (index <= 0) return DEFAULT_SCANNED_DOCUMENTS_ROOT;

  const parent = normalized.slice(0, index);
  if (!parent) return null;
  return parent;
}

export function getBackFolderLabel(parentPath: string): string {
  return formatFolderLabel(parentPath);
}

export function resolveInitialBrowsePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance`;

  const parent = getParentFolderPath(trimmed);
  return parent ?? trimmed;
}
