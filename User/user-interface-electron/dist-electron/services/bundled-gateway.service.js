"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBundledGatewayRunning = ensureBundledGatewayRunning;
exports.stopBundledGateway = stopBundledGateway;
exports.initBundledGatewayLifecycle = initBundledGatewayLifecycle;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const gateway_config_service_1 = require("./gateway-config.service");
const gateway_discovery_service_1 = require("./gateway-discovery.service");
let bundledGatewayProcess = null;
function bundledGatewayPaths() {
    const gatewayRoot = path_1.default.join(process.resourcesPath, "gateway");
    const distMain = path_1.default.join(gatewayRoot, "dist", "main.js");
    return { gatewayRoot, distMain };
}
async function ensureBundledGatewayRunning() {
    if (process.env.VITE_DEV_SERVER_URL)
        return;
    const { gatewayRoot, distMain } = bundledGatewayPaths();
    if (!fs_1.default.existsSync(distMain))
        return;
    const apiUrl = (0, gateway_config_service_1.getDefaultGatewayApiUrl)();
    if (await (0, gateway_discovery_service_1.probeGatewayHealth)(apiUrl))
        return;
    const programDataRoot = path_1.default.join(process.env.ProgramData ?? "C:\\ProgramData", "Bukolabs", "gateway");
    const workingRoot = fs_1.default.existsSync(path_1.default.join(programDataRoot, "dist", "main.js"))
        ? programDataRoot
        : gatewayRoot;
    if (bundledGatewayProcess && !bundledGatewayProcess.killed)
        return;
    bundledGatewayProcess = (0, child_process_1.spawn)(process.execPath, [path_1.default.join(workingRoot, "dist", "main.js")], {
        cwd: workingRoot,
        detached: true,
        stdio: "ignore",
        windowsHide: true,
        env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: "1",
            NODE_ENV: "production",
            BACKEND_ROLE: "gateway",
            HOST: "0.0.0.0",
        },
    });
    bundledGatewayProcess.unref();
}
function stopBundledGateway() {
    if (!bundledGatewayProcess || bundledGatewayProcess.killed)
        return;
    bundledGatewayProcess.kill();
    bundledGatewayProcess = null;
}
function initBundledGatewayLifecycle() {
    electron_1.app.on("before-quit", () => {
        stopBundledGateway();
    });
}
