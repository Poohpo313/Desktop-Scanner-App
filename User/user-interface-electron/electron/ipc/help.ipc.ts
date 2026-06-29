import type { IpcMain } from "electron";
import { helpService } from "../services/help.service";

export function registerHelpIpc(ipcMain: IpcMain) {
  ipcMain.handle("help:submit-concern", (_event, payload) => helpService.submitConcern(payload));
  ipcMain.handle("help:list-tickets", (_event, payload?: { userId?: number }) =>
    helpService.listTickets(payload?.userId),
  );
  ipcMain.handle("help:mark-reply-read", (_event, payload: { concernId: number }) =>
    helpService.markReplyRead(payload.concernId),
  );
}
