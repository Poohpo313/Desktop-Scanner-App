"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGatewayIpc = registerGatewayIpc;
const api_service_1 = require("../services/api.service");
const gateway_discovery_service_1 = require("../services/gateway-discovery.service");
const gateway_config_service_1 = require("../services/gateway-config.service");
function registerGatewayIpc(ipcMain) {
    ipcMain.handle("gateway:get-config", async () => ({
        url: (0, gateway_config_service_1.getGatewayApiUrl)(),
        defaultUrl: (0, gateway_config_service_1.getDefaultGatewayApiUrl)(),
    }));
    ipcMain.handle("gateway:set-url", async (_event, payload) => {
        const url = (0, gateway_config_service_1.setGatewayApiUrl)(payload.url);
        const reachable = await (0, api_service_1.isOnlineAvailable)(url);
        return { success: true, url, reachable };
    });
    ipcMain.handle("gateway:check-available", async () => {
        const currentUrl = (0, gateway_config_service_1.getGatewayApiUrl)();
        if (await (0, api_service_1.isOnlineAvailable)(currentUrl)) {
            return { reachable: true, url: currentUrl, discovered: false };
        }
        const discoveredUrl = (await (0, gateway_discovery_service_1.discoverGatewayUrlFast)(currentUrl)) ??
            (await (0, gateway_discovery_service_1.discoverGatewayUrlFast)((0, gateway_config_service_1.getDefaultGatewayApiUrl)())) ??
            (await (0, gateway_discovery_service_1.discoverGatewayUrl)(currentUrl)) ??
            (await (0, gateway_discovery_service_1.discoverGatewayUrl)((0, gateway_config_service_1.getDefaultGatewayApiUrl)()));
        if (discoveredUrl) {
            (0, gateway_config_service_1.setGatewayApiUrl)(discoveredUrl);
            return { reachable: true, url: discoveredUrl, discovered: true };
        }
        return { reachable: false, url: currentUrl, discovered: false };
    });
    ipcMain.handle("gateway:discover", async () => {
        const discoveredUrl = await (0, gateway_discovery_service_1.discoverGatewayUrl)((0, gateway_config_service_1.getGatewayApiUrl)());
        if (!discoveredUrl) {
            return { success: false, url: (0, gateway_config_service_1.getGatewayApiUrl)() };
        }
        (0, gateway_config_service_1.setGatewayApiUrl)(discoveredUrl);
        return { success: true, url: discoveredUrl };
    });
}
