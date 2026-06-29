import type { IpcMain } from "electron";
import { authService } from "../services/auth.service";

export function registerAuthIpc(ipcMain: IpcMain) {
  ipcMain.handle(
    "auth:login",
    async (_event, payload: { username: string; password: string }) => {
      return authService.login(payload.username, payload.password);
    }
  );

  ipcMain.handle("auth:logout", async (_event, payload: { token: string }) => {
    return authService.logout(payload.token);
  });

  ipcMain.handle(
    "auth:activate-key",
    async (
      _event,
      payload: { serialKey: string; username: string }
    ) => {
      return authService.activateKey(payload.serialKey, payload.username);
    }
  );

  ipcMain.handle(
    "auth:check-session",
    async (_event, payload: { token: string }) => {
      return authService.checkSession(payload.token);
    }
  );

  ipcMain.handle(
    "auth:request-recovery",
    async (
      _event,
      payload: { channel: "email" | "sms"; username?: string; context?: string }
    ) => {
      return authService.requestRecovery(payload);
    }
  );

  ipcMain.handle("auth:get-profile", async (_event, payload: { token: string }) => {
    return authService.getProfile(payload.token);
  });

  ipcMain.handle(
    "auth:update-profile",
    async (
      _event,
      payload: {
        token: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
      },
    ) => authService.updateProfile(payload.token, payload),
  );

  ipcMain.handle(
    "auth:change-password",
    async (
      _event,
      payload: { token: string; currentPassword: string; newPassword: string },
    ) => authService.changePassword(payload.token, payload.currentPassword, payload.newPassword),
  );

  ipcMain.handle(
    "auth:get-support-contact",
    async (_event, payload: { token?: string; username?: string; serialKey?: string }) =>
      authService.getSupportContact(
        payload.token ?? "",
        payload.username,
        payload.serialKey,
      ),
  );

  ipcMain.handle("auth:sync-pending-activations", async () => authService.syncPendingActivations());
}
