import type { IpcMain } from "electron";
import { fsService } from "../services/fs.service";

export function registerFsIpc(ipcMain: IpcMain) {
  ipcMain.handle("fs:get-quick-locations", async () => fsService.getQuickLocations());

  ipcMain.handle("fs:list-directories", async (_event, payload: { path: string }) =>
    fsService.listDirectories(payload.path)
  );

  ipcMain.handle("fs:list-contents", async (_event, payload: { path: string }) =>
    fsService.listContents(payload.path)
  );

  ipcMain.handle("fs:pick-folder", async (_event, payload?: { defaultPath?: string }) =>
    fsService.pickFolder(payload?.defaultPath)
  );

  ipcMain.handle("fs:pick-document", async (_event, payload?: { defaultPath?: string }) =>
    fsService.pickDocument(payload?.defaultPath)
  );

  ipcMain.handle("fs:pick-image", async (_event, payload?: { defaultPath?: string }) =>
    fsService.pickImage(payload?.defaultPath)
  );

  ipcMain.handle("fs:show-item-in-folder", async (_event, payload: { path: string }) =>
    fsService.showItemInFolder(payload.path)
  );

  ipcMain.handle("fs:open-path", async (_event, payload: { path: string }) =>
    fsService.openDocumentWithApp(payload.path)
  );

  ipcMain.handle("fs:open-in-word", async (_event, payload: { path: string }) =>
    fsService.openInWord(payload.path)
  );

  ipcMain.handle("fs:validate-directory", async (_event, payload: { path: string }) =>
    fsService.validateDirectory(payload.path)
  );

  ipcMain.handle("fs:ensure-directory", async (_event, payload: { path: string }) =>
    fsService.ensureDirectory(payload.path)
  );

  ipcMain.handle("fs:get-default-storage-root", async () => ({
    path: fsService.getDefaultStorageRoot(),
  }));

  ipcMain.handle("fs:ensure-default-storage-root", async () => fsService.ensureDefaultStorageRoot());

  ipcMain.handle(
    "fs:import-document-to-folder",
    async (_event, payload: { sourcePath: string; targetDir: string }) =>
      fsService.importDocumentToFolder(payload.sourcePath, payload.targetDir),
  );

  ipcMain.handle("fs:resolve-unique-file-path", async (_event, payload: { dirPath: string; fileName: string }) =>
    fsService.resolveUniqueFilePath(payload.dirPath, payload.fileName)
  );

  ipcMain.handle("fs:list-documents-in-folder", async (_event, payload: { path: string }) =>
    fsService.listDocumentsInFolder(payload.path)
  );

  ipcMain.handle("fs:rename-path", async (_event, payload: { oldPath: string; newPath: string }) =>
    fsService.renamePath(payload.oldPath, payload.newPath)
  );

  ipcMain.handle("fs:delete-path", async (_event, payload: { path: string }) =>
    fsService.deletePath(payload.path)
  );

  ipcMain.handle("fs:copy-path-to-clipboard", async (_event, payload: { path: string }) =>
    fsService.copyPathToClipboard(payload.path)
  );

  ipcMain.handle("fs:open-folder", async (_event, payload: { path: string }) =>
    fsService.openFolder(payload.path)
  );

  ipcMain.handle(
    "fs:move-to-recycle-bin",
    async (_event, payload: { path: string; storageRoot: string }) =>
      fsService.moveToRecycleBin(payload.path, payload.storageRoot),
  );

  ipcMain.handle(
    "fs:restore-from-recycle-bin",
    async (_event, payload: { recycledPath: string; originalPath: string }) =>
      fsService.restoreFromRecycleBin(payload.recycledPath, payload.originalPath),
  );
}
