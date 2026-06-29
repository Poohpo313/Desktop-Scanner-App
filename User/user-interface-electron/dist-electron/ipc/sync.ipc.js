"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSyncIpc = registerSyncIpc;
const sync_service_1 = require("../services/sync.service");
function registerSyncIpc(ipcMain) {
    ipcMain.handle("sync:trigger", async () => sync_service_1.syncService.trigger());
    ipcMain.handle("sync:status", async () => sync_service_1.syncService.status());
}
