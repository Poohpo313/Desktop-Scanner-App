import type { IpcMain } from "electron";
import { fileService } from "../services/file.service";

export function registerFilesIpc(ipcMain: IpcMain) {
  ipcMain.handle(
    "files:save",
    async (
      _event,
      payload: {
        imageBuffer?: ArrayBuffer;
        imageBuffers?: ArrayBuffer[];
        filename: string;
        folderId?: number;
        userId: number;
        fileType?: string;
        exportFolder?: string;
        ocrText?: string;
        skipOcr?: boolean;
      }
    ) => fileService.save(payload)
  );

  ipcMain.handle(
    "files:list",
    async (_event, payload: { folderId?: number; userId: number }) =>
      fileService.list(payload)
  );

  ipcMain.handle(
    "files:search",
    async (_event, payload: { query: string; filters?: Record<string, unknown> }) =>
      fileService.search(payload)
  );

  ipcMain.handle("files:delete", async (_event, payload: { documentId: number }) =>
    fileService.delete(payload.documentId)
  );

  ipcMain.handle("files:restore", async (_event, payload: { documentId: number }) =>
    fileService.restore(payload.documentId)
  );

  ipcMain.handle("files:get-ocr-status", async (_event, payload: { documentId: number }) =>
    fileService.getOcrStatus(payload.documentId)
  );

  ipcMain.handle("files:extract-ocr-from-path", async (_event, payload: { path: string }) =>
    fileService.extractOcrFromPath(payload.path)
  );
}
