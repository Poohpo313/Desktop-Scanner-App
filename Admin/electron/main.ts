import { app, BrowserWindow, ipcMain, shell } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeExportDirectories, resolveExportDirectory } from "./exportPaths";
import type { ExportFolderId } from "../src/config/exportPaths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type SaveTextFilePayload = {
  content: string;
  filename: string;
  exportFolder: ExportFolderId;
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

ipcMain.handle("fs:save-text-file", async (_event, payload: SaveTextFilePayload) => {
  const directory = resolveExportDirectory(payload.exportFolder);
  const filePath = path.join(directory, payload.filename);

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, payload.content, "utf8");

  return {
    filePath,
    directoryPath: directory,
    sizeBytes: Buffer.byteLength(payload.content, "utf8"),
  };
});

ipcMain.handle("fs:open-export-folder", async (_event, exportFolder: ExportFolderId) => {
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
