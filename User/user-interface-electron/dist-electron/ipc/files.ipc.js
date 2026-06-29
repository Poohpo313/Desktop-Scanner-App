"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFilesIpc = registerFilesIpc;
const file_service_1 = require("../services/file.service");
function registerFilesIpc(ipcMain) {
    ipcMain.handle("files:save", async (_event, payload) => file_service_1.fileService.save(payload));
    ipcMain.handle("files:list", async (_event, payload) => file_service_1.fileService.list(payload));
    ipcMain.handle("files:search", async (_event, payload) => file_service_1.fileService.search(payload));
    ipcMain.handle("files:delete", async (_event, payload) => file_service_1.fileService.delete(payload.documentId));
    ipcMain.handle("files:restore", async (_event, payload) => file_service_1.fileService.restore(payload.documentId));
    ipcMain.handle("files:get-ocr-status", async (_event, payload) => file_service_1.fileService.getOcrStatus(payload.documentId));
    ipcMain.handle("files:extract-ocr-from-path", async (_event, payload) => file_service_1.fileService.extractOcrFromPath(payload.path));
}
