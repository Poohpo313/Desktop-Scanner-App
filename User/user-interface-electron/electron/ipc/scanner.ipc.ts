import type { IpcMain } from "electron";
import { scannerService } from "../services/scanner.service";

export function registerScannerIpc(ipcMain: IpcMain) {
  ipcMain.handle("scanner:list-devices", async () => scannerService.listDevices());

  ipcMain.handle(
    "scanner:get-capabilities",
    async (_event, payload: { deviceId: string }) =>
      scannerService.getCapabilities(payload.deviceId)
  );

  ipcMain.handle(
    "scanner:start-scan",
    async (
      _event,
      payload: { deviceId: string; settings: Record<string, unknown> }
    ) => scannerService.startScan(payload.deviceId, payload.settings)
  );

  ipcMain.handle("scanner:cancel-scan", async () => scannerService.cancelScan());
}
