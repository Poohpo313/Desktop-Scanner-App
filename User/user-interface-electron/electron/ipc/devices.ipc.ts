import type { IpcMain } from "electron";
import { deviceService } from "../services/device.service";

export function registerDevicesIpc(ipcMain: IpcMain) {
  ipcMain.handle(
    "devices:register",
    async (
      _event,
      payload: {
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        assignedUser: number;
        username?: string;
      },
    ) => deviceService.registerForUser(payload),
  );

  ipcMain.handle(
    "devices:sync-for-user",
    async (_event, payload: { userId: number; username: string }) =>
      deviceService.syncClientDevicesForUser(payload.userId, payload.username),
  );
}
