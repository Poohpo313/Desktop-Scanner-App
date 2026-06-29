import { contextBridge, ipcRenderer } from "electron";
import type { ExportFolderId } from "../src/config/exportPaths";

type SaveTextFilePayload = {
  content: string;
  filename: string;
  exportFolder: ExportFolderId;
};

type SaveTextFileResult = {
  filePath: string;
  directoryPath: string;
  sizeBytes: number;
};

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  saveTextFile: (payload: SaveTextFilePayload): Promise<SaveTextFileResult> =>
    ipcRenderer.invoke("fs:save-text-file", payload),
  openExportFolder: (exportFolder: ExportFolderId): Promise<void> =>
    ipcRenderer.invoke("fs:open-export-folder", exportFolder),
});
