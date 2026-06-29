import { app, BrowserWindow, ipcMain, session } from "electron";
import path from "path";
import { loadEnvFile } from "./load-env";
import { registerAuthIpc } from "./ipc/auth.ipc";
import { registerFilesIpc } from "./ipc/files.ipc";
import { registerKeysIpc } from "./ipc/keys.ipc";
import { registerPrintIpc } from "./ipc/print.ipc";
import { registerScannerIpc } from "./ipc/scanner.ipc";
import { registerFsIpc } from "./ipc/fs.ipc";
import { registerSyncIpc } from "./ipc/sync.ipc";
import { registerDevicesIpc } from "./ipc/devices.ipc";
import { registerHelpIpc } from "./ipc/help.ipc";
import { registerGatewayIpc } from "./ipc/gateway.ipc";
import { authService } from "./services/auth.service";
import { initGatewayConfig, setGatewayApiUrl, getGatewayApiUrl } from "./services/gateway-config.service";
import { discoverGatewayUrl, discoverGatewayUrlFast } from "./services/gateway-discovery.service";
import { isOnlineAvailable } from "./services/api.service";
import { devicePresenceService } from "./services/device-presence.service";
import { initDatabase } from "./services/db.service";
import { initSessionStore } from "./services/session-store";
import { ensureBundledGatewayRunning, initBundledGatewayLifecycle } from "./services/bundled-gateway.service";
import { fsService } from "./services/fs.service";

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    autoHideMenuBar: true,
    backgroundColor: "#f5f7f9",
    title: "Desktop Scanner App by Bukolabs.io",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Strict CSP breaks Vite dev (inline scripts + eval for HMR). Apply only in production.
  if (!isDev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' http://* https://*",
          ],
        },
      });
    });
  }

  win.webContents.on("did-fail-load", (_event, code, desc, url) => {
    console.error("[renderer] failed to load", code, desc, url);
  });

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

loadEnvFile();

app.whenReady().then(async () => {
  const userDataPath = app.getPath("userData");
  initSessionStore(userDataPath);
  initGatewayConfig(userDataPath);
  authService.initStores(userDataPath);
  authService.restorePersistedSessions();

  registerAuthIpc(ipcMain);
  registerGatewayIpc(ipcMain);
  registerKeysIpc(ipcMain);
  registerScannerIpc(ipcMain);
  registerFilesIpc(ipcMain);
  registerPrintIpc(ipcMain);
  registerSyncIpc(ipcMain);
  registerFsIpc(ipcMain);
  registerDevicesIpc(ipcMain);
  registerHelpIpc(ipcMain);

  await fsService.ensureDefaultStorageRoot();

  initBundledGatewayLifecycle();
  await ensureBundledGatewayRunning();

  const currentGateway = getGatewayApiUrl();
  const discovered =
    (await discoverGatewayUrlFast(currentGateway)) ?? (await discoverGatewayUrl(currentGateway));
  if (discovered) {
    setGatewayApiUrl(discovered);
  } else if (!(await isOnlineAvailable(currentGateway))) {
    console.warn("[startup] Gateway not reachable at", currentGateway);
  }

  await initDatabase(app.getAppPath());
  createWindow();
});

app.on("before-quit", (event) => {
  if (devicePresenceService.isStopping()) return;

  event.preventDefault();
  void devicePresenceService.stop().finally(() => {
    app.exit(0);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
