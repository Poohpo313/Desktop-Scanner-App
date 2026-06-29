"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthIpc = registerAuthIpc;
const auth_service_1 = require("../services/auth.service");
function registerAuthIpc(ipcMain) {
    ipcMain.handle("auth:login", async (_event, payload) => {
        return auth_service_1.authService.login(payload.username, payload.password);
    });
    ipcMain.handle("auth:logout", async (_event, payload) => {
        return auth_service_1.authService.logout(payload.token);
    });
    ipcMain.handle("auth:activate-key", async (_event, payload) => {
        return auth_service_1.authService.activateKey(payload.serialKey, payload.username);
    });
    ipcMain.handle("auth:check-session", async (_event, payload) => {
        return auth_service_1.authService.checkSession(payload.token);
    });
    ipcMain.handle("auth:request-recovery", async (_event, payload) => {
        return auth_service_1.authService.requestRecovery(payload);
    });
    ipcMain.handle("auth:get-profile", async (_event, payload) => {
        return auth_service_1.authService.getProfile(payload.token);
    });
    ipcMain.handle("auth:update-profile", async (_event, payload) => auth_service_1.authService.updateProfile(payload.token, payload));
    ipcMain.handle("auth:change-password", async (_event, payload) => auth_service_1.authService.changePassword(payload.token, payload.currentPassword, payload.newPassword));
    ipcMain.handle("auth:get-support-contact", async (_event, payload) => auth_service_1.authService.getSupportContact(payload.token ?? "", payload.username, payload.serialKey));
    ipcMain.handle("auth:sync-pending-activations", async () => auth_service_1.authService.syncPendingActivations());
}
