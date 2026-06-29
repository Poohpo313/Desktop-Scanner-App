"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDevicesIpc = registerDevicesIpc;
const device_service_1 = require("../services/device.service");
function registerDevicesIpc(ipcMain) {
    ipcMain.handle("devices:register", async (_event, payload) => device_service_1.deviceService.registerForUser(payload));
    ipcMain.handle("devices:sync-for-user", async (_event, payload) => device_service_1.deviceService.syncClientDevicesForUser(payload.userId, payload.username));
}
