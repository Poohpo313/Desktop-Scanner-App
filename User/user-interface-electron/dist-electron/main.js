"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const load_env_1 = require("./load-env");
const auth_ipc_1 = require("./ipc/auth.ipc");
const files_ipc_1 = require("./ipc/files.ipc");
const keys_ipc_1 = require("./ipc/keys.ipc");
const print_ipc_1 = require("./ipc/print.ipc");
const scanner_ipc_1 = require("./ipc/scanner.ipc");
const fs_ipc_1 = require("./ipc/fs.ipc");
const sync_ipc_1 = require("./ipc/sync.ipc");
const devices_ipc_1 = require("./ipc/devices.ipc");
const help_ipc_1 = require("./ipc/help.ipc");
const gateway_ipc_1 = require("./ipc/gateway.ipc");
const auth_service_1 = require("./services/auth.service");
const gateway_config_service_1 = require("./services/gateway-config.service");
const device_presence_service_1 = require("./services/device-presence.service");
const db_service_1 = require("./services/db.service");
const session_store_1 = require("./services/session-store");
const bundled_gateway_service_1 = require("./services/bundled-gateway.service");
const fs_service_1 = require("./services/fs.service");
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        autoHideMenuBar: true,
        backgroundColor: "#f5f7f9",
        title: "Desktop Scanner App by Bukolabs.io",
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
    // Strict CSP breaks Vite dev (inline scripts + eval for HMR). Apply only in production.
    if (!isDev) {
        electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
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
    }
    else {
        win.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
    }
}
(0, load_env_1.loadEnvFile)();
electron_1.app.whenReady().then(async () => {
    const userDataPath = electron_1.app.getPath("userData");
    (0, session_store_1.initSessionStore)(userDataPath);
    (0, gateway_config_service_1.initGatewayConfig)(userDataPath);
    auth_service_1.authService.initStores(userDataPath);
    auth_service_1.authService.restorePersistedSessions();
    (0, auth_ipc_1.registerAuthIpc)(electron_1.ipcMain);
    (0, gateway_ipc_1.registerGatewayIpc)(electron_1.ipcMain);
    (0, keys_ipc_1.registerKeysIpc)(electron_1.ipcMain);
    (0, scanner_ipc_1.registerScannerIpc)(electron_1.ipcMain);
    (0, files_ipc_1.registerFilesIpc)(electron_1.ipcMain);
    (0, print_ipc_1.registerPrintIpc)(electron_1.ipcMain);
    (0, sync_ipc_1.registerSyncIpc)(electron_1.ipcMain);
    (0, fs_ipc_1.registerFsIpc)(electron_1.ipcMain);
    (0, devices_ipc_1.registerDevicesIpc)(electron_1.ipcMain);
    (0, help_ipc_1.registerHelpIpc)(electron_1.ipcMain);
    await fs_service_1.fsService.ensureDefaultStorageRoot();
    (0, bundled_gateway_service_1.initBundledGatewayLifecycle)();
    void (0, bundled_gateway_service_1.ensureBundledGatewayRunning)();
    createWindow();
    void (0, db_service_1.initDatabase)(electron_1.app.getAppPath());
});
electron_1.app.on("before-quit", (event) => {
    if (device_presence_service_1.devicePresenceService.isStopping())
        return;
    event.preventDefault();
    void device_presence_service_1.devicePresenceService.stop().finally(() => {
        electron_1.app.exit(0);
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
