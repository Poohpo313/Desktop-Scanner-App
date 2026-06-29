import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { app } from "electron";
import { getDefaultGatewayApiUrl } from "./gateway-config.service";
import { probeGatewayHealth } from "./gateway-discovery.service";

let bundledGatewayProcess: ChildProcess | null = null;

function bundledGatewayPaths() {
  const gatewayRoot = path.join(process.resourcesPath, "gateway");
  const distMain = path.join(gatewayRoot, "dist", "main.js");
  return { gatewayRoot, distMain };
}

export async function ensureBundledGatewayRunning(): Promise<void> {
  if (process.env.VITE_DEV_SERVER_URL) return;

  const { gatewayRoot, distMain } = bundledGatewayPaths();
  if (!fs.existsSync(distMain)) return;

  const apiUrl = getDefaultGatewayApiUrl();
  if (await probeGatewayHealth(apiUrl)) return;

  const programDataRoot = path.join(process.env.ProgramData ?? "C:\\ProgramData", "Bukolabs", "gateway");
  const workingRoot = fs.existsSync(path.join(programDataRoot, "dist", "main.js"))
    ? programDataRoot
    : gatewayRoot;

  if (bundledGatewayProcess && !bundledGatewayProcess.killed) return;

  bundledGatewayProcess = spawn(process.execPath, [path.join(workingRoot, "dist", "main.js")], {
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

export function stopBundledGateway() {
  if (!bundledGatewayProcess || bundledGatewayProcess.killed) return;
  bundledGatewayProcess.kill();
  bundledGatewayProcess = null;
}

export function initBundledGatewayLifecycle() {
  app.on("before-quit", () => {
    stopBundledGateway();
  });
}
