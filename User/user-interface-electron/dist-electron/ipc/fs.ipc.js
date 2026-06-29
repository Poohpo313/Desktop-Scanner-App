"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFsIpc = registerFsIpc;
const fs_service_1 = require("../services/fs.service");
function registerFsIpc(ipcMain) {
    ipcMain.handle("fs:get-quick-locations", async () => fs_service_1.fsService.getQuickLocations());
    ipcMain.handle("fs:list-directories", async (_event, payload) => fs_service_1.fsService.listDirectories(payload.path));
    ipcMain.handle("fs:list-contents", async (_event, payload) => fs_service_1.fsService.listContents(payload.path));
    ipcMain.handle("fs:pick-folder", async (_event, payload) => fs_service_1.fsService.pickFolder(payload?.defaultPath));
    ipcMain.handle("fs:pick-document", async (_event, payload) => fs_service_1.fsService.pickDocument(payload?.defaultPath));
    ipcMain.handle("fs:pick-image", async (_event, payload) => fs_service_1.fsService.pickImage(payload?.defaultPath));
    ipcMain.handle("fs:show-item-in-folder", async (_event, payload) => fs_service_1.fsService.showItemInFolder(payload.path));
    ipcMain.handle("fs:open-path", async (_event, payload) => fs_service_1.fsService.openDocumentWithApp(payload.path));
    ipcMain.handle("fs:open-in-word", async (_event, payload) => fs_service_1.fsService.openInWord(payload.path));
    ipcMain.handle("fs:validate-directory", async (_event, payload) => fs_service_1.fsService.validateDirectory(payload.path));
    ipcMain.handle("fs:ensure-directory", async (_event, payload) => fs_service_1.fsService.ensureDirectory(payload.path));
    ipcMain.handle("fs:get-default-storage-root", async () => ({
        path: fs_service_1.fsService.getDefaultStorageRoot(),
    }));
    ipcMain.handle("fs:ensure-default-storage-root", async () => fs_service_1.fsService.ensureDefaultStorageRoot());
    ipcMain.handle("fs:import-document-to-folder", async (_event, payload) => fs_service_1.fsService.importDocumentToFolder(payload.sourcePath, payload.targetDir));
    ipcMain.handle("fs:resolve-unique-file-path", async (_event, payload) => fs_service_1.fsService.resolveUniqueFilePath(payload.dirPath, payload.fileName));
    ipcMain.handle("fs:list-documents-in-folder", async (_event, payload) => fs_service_1.fsService.listDocumentsInFolder(payload.path));
    ipcMain.handle("fs:rename-path", async (_event, payload) => fs_service_1.fsService.renamePath(payload.oldPath, payload.newPath));
    ipcMain.handle("fs:delete-path", async (_event, payload) => fs_service_1.fsService.deletePath(payload.path));
    ipcMain.handle("fs:copy-path-to-clipboard", async (_event, payload) => fs_service_1.fsService.copyPathToClipboard(payload.path));
    ipcMain.handle("fs:open-folder", async (_event, payload) => fs_service_1.fsService.openFolder(payload.path));
    ipcMain.handle("fs:move-to-recycle-bin", async (_event, payload) => fs_service_1.fsService.moveToRecycleBin(payload.path, payload.storageRoot));
    ipcMain.handle("fs:restore-from-recycle-bin", async (_event, payload) => fs_service_1.fsService.restoreFromRecycleBin(payload.recycledPath, payload.originalPath));
}
