"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerScannerIpc = registerScannerIpc;
const scanner_service_1 = require("../services/scanner.service");
function registerScannerIpc(ipcMain) {
    ipcMain.handle("scanner:list-devices", async () => scanner_service_1.scannerService.listDevices());
    ipcMain.handle("scanner:get-capabilities", async (_event, payload) => scanner_service_1.scannerService.getCapabilities(payload.deviceId));
    ipcMain.handle("scanner:start-scan", async (_event, payload) => scanner_service_1.scannerService.startScan(payload.deviceId, payload.settings));
    ipcMain.handle("scanner:cancel-scan", async () => scanner_service_1.scannerService.cancelScan());
}
