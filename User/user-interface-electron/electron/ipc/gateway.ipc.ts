import type { IpcMain } from "electron";
import { isOnlineAvailable } from "../services/api.service";
import {
  discoverGatewayUrl,
  discoverGatewayUrlFast,
} from "../services/gateway-discovery.service";
import {
  getDefaultGatewayApiUrl,
  getGatewayApiUrl,
  setGatewayApiUrl,
} from "../services/gateway-config.service";

export function registerGatewayIpc(ipcMain: IpcMain) {
  ipcMain.handle("gateway:get-config", async () => ({
    url: getGatewayApiUrl(),
    defaultUrl: getDefaultGatewayApiUrl(),
  }));

  ipcMain.handle("gateway:set-url", async (_event, payload: { url: string }) => {
    const url = setGatewayApiUrl(payload.url);
    const reachable = await isOnlineAvailable(url);
    return { success: true, url, reachable };
  });

  ipcMain.handle("gateway:check-available", async () => {
    const currentUrl = getGatewayApiUrl();
    if (await isOnlineAvailable(currentUrl)) {
      return { reachable: true, url: currentUrl, discovered: false };
    }

    const discoveredUrl =
      (await discoverGatewayUrlFast(currentUrl)) ??
      (await discoverGatewayUrlFast(getDefaultGatewayApiUrl())) ??
      (await discoverGatewayUrl(currentUrl)) ??
      (await discoverGatewayUrl(getDefaultGatewayApiUrl()));

    if (discoveredUrl) {
      setGatewayApiUrl(discoveredUrl);
      return { reachable: true, url: discoveredUrl, discovered: true };
    }

    return { reachable: false, url: currentUrl, discovered: false };
  });

  ipcMain.handle("gateway:discover", async () => {
    const discoveredUrl = await discoverGatewayUrl(getGatewayApiUrl());
    if (!discoveredUrl) {
      return { success: false as const, url: getGatewayApiUrl() };
    }

    setGatewayApiUrl(discoveredUrl);
    return { success: true as const, url: discoveredUrl };
  });
}
