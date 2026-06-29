import type { ExportFolderId } from "../config/exportPaths";

export {};

declare global {
  interface Window {
    electronAPI?: {
      isElectron: true;
      saveTextFile: (payload: {
        content: string;
        filename: string;
        exportFolder: ExportFolderId;
      }) => Promise<{
        filePath: string;
        directoryPath: string;
        sizeBytes: number;
      }>;
      openExportFolder: (exportFolder: ExportFolderId) => Promise<void>;
    };
  }
}
