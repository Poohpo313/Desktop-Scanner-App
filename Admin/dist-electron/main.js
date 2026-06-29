import { ipcMain, shell, app, BrowserWindow } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
const EXPORT_PATHS = {
  "activity-logs": {
    folderName: "ActivityLogs",
    filenamePrefix: "Logs"
  },
  reports: {
    folderName: "Reports",
    filenamePrefix: "Reports"
  },
  "serial-keys": {
    folderName: "SerialKeys",
    filenamePrefix: "Keys"
  }
};
const PREFERRED_EXPORT_ROOT = "C:\\Documents\\Exports";
let resolvedExportRoot = PREFERRED_EXPORT_ROOT;
function resolveExportDirectory(exportFolder) {
  const { folderName } = EXPORT_PATHS[exportFolder];
  return path.join(resolvedExportRoot, folderName);
}
async function canWriteDirectory(directory) {
  try {
    await fs.mkdir(directory, { recursive: true });
    const probePath = path.join(directory, ".write-test");
    await fs.writeFile(probePath, "ok", "utf8");
    await fs.unlink(probePath);
    return true;
  } catch {
    return false;
  }
}
async function initializeExportDirectories() {
  const preferredOk = await canWriteDirectory(PREFERRED_EXPORT_ROOT);
  if (preferredOk) {
    resolvedExportRoot = PREFERRED_EXPORT_ROOT;
  } else {
    resolvedExportRoot = path.join(os.homedir(), "Documents", "Exports");
    await fs.mkdir(resolvedExportRoot, { recursive: true });
  }
  await Promise.all(
    Object.keys(EXPORT_PATHS).map(async (exportFolder) => {
      const directory = resolveExportDirectory(exportFolder);
      await fs.mkdir(directory, { recursive: true });
    })
  );
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  win.once("ready-to-show", () => {
    win.show();
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
}
ipcMain.handle("fs:save-text-file", async (_event, payload) => {
  const directory = resolveExportDirectory(payload.exportFolder);
  const filePath = path.join(directory, payload.filename);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, payload.content, "utf8");
  return {
    filePath,
    directoryPath: directory,
    sizeBytes: Buffer.byteLength(payload.content, "utf8")
  };
});
ipcMain.handle("fs:open-export-folder", async (_event, exportFolder) => {
  const directory = resolveExportDirectory(exportFolder);
  await fs.mkdir(directory, { recursive: true });
  await shell.openPath(directory);
});
app.whenReady().then(async () => {
  await initializeExportDirectories();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
