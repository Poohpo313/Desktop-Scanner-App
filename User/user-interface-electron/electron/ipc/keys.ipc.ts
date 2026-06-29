import type { IpcMain } from "electron";
import { keysService } from "../services/keys.service";

export function registerKeysIpc(ipcMain: IpcMain) {
  ipcMain.handle("keys:validate", async (_event, payload: { serialKey: string }) => {
    const normalized = payload.serialKey.trim();
    if (!keysService.validateFormat(normalized)) {
      return { valid: false, error: "Invalid serial key format" };
    }
    const key = await keysService.findKey(normalized);
    if (!key) return { valid: false, error: "Invalid serial key" };
    if (key.status !== "unused" && key.status !== "assigned") {
      return { valid: false, error: `Serial key is ${key.status}` };
    }
    return { valid: true };
  });

  ipcMain.handle("keys:get-status", async (_event, payload: { userId?: number }) => {
    const { fetchMyKeyStatusOnline } = await import("../services/api.service");
    const online = await fetchMyKeyStatusOnline(payload.userId);
    if (online.success && online.data && payload.userId != null) {
      await keysService.syncKeyExpiryFromOnline(payload.userId, online.data as {
        key: { expiresAt: string | null; durationDays: number | null; extensionCount?: number };
      });
      return online;
    }
    if (payload.userId != null) {
      const local = await keysService.getLocalKeyStatus(payload.userId);
      if (local.success) return local;
    }
    return online;
  });

  ipcMain.handle(
    "keys:request-extension",
    async (_event, payload: { requestedDays: number; userNote?: string; userId?: number }) => {
      const { requestKeyExtensionOnline } = await import("../services/api.service");
      return requestKeyExtensionOnline(payload.requestedDays, payload.userNote, payload.userId);
    },
  );

  ipcMain.handle(
    "keys:request-renewal",
    async (_event, payload: { requestedDays: number; userNote?: string; userId?: number }) => {
      const { requestKeyRenewalOnline } = await import("../services/api.service");
      return requestKeyRenewalOnline(payload.requestedDays, payload.userNote, payload.userId);
    },
  );
}
