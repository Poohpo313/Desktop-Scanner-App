import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ExportFolderId } from "../src/config/exportPaths";
import { EXPORT_PATHS } from "../src/config/exportPaths";

const PREFERRED_EXPORT_ROOT = "C:\\Documents\\Exports";

let resolvedExportRoot = PREFERRED_EXPORT_ROOT;

export function getExportRoot(): string {
  return resolvedExportRoot;
}

export function resolveExportDirectory(exportFolder: ExportFolderId): string {
  const { folderName } = EXPORT_PATHS[exportFolder];
  return path.join(resolvedExportRoot, folderName);
}

async function canWriteDirectory(directory: string): Promise<boolean> {
  try {
    await fs.mkdir(directory, { recursive: true });
    const probePath = path.join(directory, ".write-test");
    await fs.writeFile(probePath, "ok", "utf8");
    await fs.unlink(probePath);
    return true;
  } catch {
    return false;
  }
}

export async function initializeExportDirectories(): Promise<void> {
  const preferredOk = await canWriteDirectory(PREFERRED_EXPORT_ROOT);
  if (preferredOk) {
    resolvedExportRoot = PREFERRED_EXPORT_ROOT;
  } else {
    resolvedExportRoot = path.join(os.homedir(), "Documents", "Exports");
    await fs.mkdir(resolvedExportRoot, { recursive: true });
  }

  await Promise.all(
    (Object.keys(EXPORT_PATHS) as ExportFolderId[]).map(async (exportFolder) => {
      const directory = resolveExportDirectory(exportFolder);
      await fs.mkdir(directory, { recursive: true });
    })
  );
}
