import type { IpcMain } from "electron";
import { printService } from "../services/print.service";

export function registerPrintIpc(ipcMain: IpcMain) {
  ipcMain.handle(
    "print:list-printers",
    async (_event, payload?: { preferredScannerName?: string | null }) =>
      printService.listPrinters(payload),
  );

  ipcMain.handle(
    "print:start",
    async (
      _event,
      payload: {
        printerId: string;
        documentPath?: string;
        settings: Record<string, unknown>;
      }
    ) => printService.print(payload)
  );
}
