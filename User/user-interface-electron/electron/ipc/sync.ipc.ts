import type { IpcMain } from "electron";
import { syncService } from "../services/sync.service";

export function registerSyncIpc(ipcMain: IpcMain) {
  ipcMain.handle("sync:trigger", async () => syncService.trigger());
  ipcMain.handle("sync:status", async () => syncService.status());
}
