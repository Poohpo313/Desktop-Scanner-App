"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerKeysIpc = registerKeysIpc;
const keys_service_1 = require("../services/keys.service");
function registerKeysIpc(ipcMain) {
    ipcMain.handle("keys:validate", async (_event, payload) => {
        const normalized = payload.serialKey.trim().toUpperCase();
        if (!keys_service_1.keysService.validateFormat(normalized)) {
            return { valid: false, error: "Invalid serial key format" };
        }
        const key = await keys_service_1.keysService.findKey(normalized);
        if (!key)
            return { valid: false, error: "Invalid serial key" };
        if (key.status !== "unused" && key.status !== "assigned") {
            return { valid: false, error: `Serial key is ${key.status}` };
        }
        return { valid: true };
    });
    ipcMain.handle("keys:get-status", async (_event, payload) => {
        const { fetchMyKeyStatusOnline } = await Promise.resolve().then(() => __importStar(require("../services/api.service")));
        const online = await fetchMyKeyStatusOnline(payload.userId);
        if (online.success && online.data && payload.userId != null) {
            await keys_service_1.keysService.syncKeyExpiryFromOnline(payload.userId, online.data);
            return online;
        }
        if (payload.userId != null) {
            const local = await keys_service_1.keysService.getLocalKeyStatus(payload.userId);
            if (local.success)
                return local;
        }
        return online;
    });
    ipcMain.handle("keys:request-extension", async (_event, payload) => {
        const { requestKeyExtensionOnline } = await Promise.resolve().then(() => __importStar(require("../services/api.service")));
        return requestKeyExtensionOnline(payload.requestedDays, payload.userNote, payload.userId);
    });
    ipcMain.handle("keys:request-renewal", async (_event, payload) => {
        const { requestKeyRenewalOnline } = await Promise.resolve().then(() => __importStar(require("../services/api.service")));
        return requestKeyRenewalOnline(payload.requestedDays, payload.userNote, payload.userId);
    });
}
