import type { ExportFolderId } from "../config/exportPaths";
import { getExportPathLabel } from "../config/exportPaths";
import { downloadCsvInBrowser } from "./downloadCsv";

export type SaveTextFileResult = {
  filePath: string;
  directoryPath: string;
  sizeBytes: number;
  usedBrowserDownload: boolean;
};

// Electron writes to a fixed folder; browser falls back to download.
export async function saveTextFile(
  content: string,
  filename: string,
  exportFolder: ExportFolderId,
  mime = "text/csv;charset=utf-8;"
): Promise<SaveTextFileResult> {
  const directoryPath = getExportPathLabel(exportFolder);

  if (window.electronAPI?.saveTextFile) {
    try {
      const result = await window.electronAPI.saveTextFile({
        content,
        filename,
        exportFolder,
      });

      return {
        ...result,
        usedBrowserDownload: false,
      };
    } catch (error) {
      console.error("Electron export save failed, using browser download fallback.", error);
    }
  }

  const sizeBytes = downloadCsvInBrowser(content, filename, mime);

  return {
    filePath: `${directoryPath}\\${filename}`,
    directoryPath,
    sizeBytes,
    usedBrowserDownload: true,
  };
}

export function isElectronRuntime(): boolean {
  return Boolean(window.electronAPI?.isElectron);
}

export function getFixedExportDirectory(exportFolder: ExportFolderId): string {
  return getExportPathLabel(exportFolder);
}
