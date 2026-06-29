"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeGatewayApiUrl = normalizeGatewayApiUrl;
exports.initGatewayConfig = initGatewayConfig;
exports.ensureDefaultGatewayConfig = ensureDefaultGatewayConfig;
exports.getDefaultGatewayApiUrl = getDefaultGatewayApiUrl;
exports.getGatewayApiUrl = getGatewayApiUrl;
exports.setGatewayApiUrl = setGatewayApiUrl;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULT_API_URL = "http://localhost:3000/api/v1";
let configFile = null;
let storedApiUrl = null;
function normalizeGatewayApiUrl(input) {
    let value = input.trim();
    if (!value)
        return DEFAULT_API_URL;
    if (!/^https?:\/\//i.test(value)) {
        value = `http://${value}`;
    }
    value = value.replace(/\/+$/, "");
    if (!/\/api\/v1$/i.test(value)) {
        value = `${value}/api/v1`;
    }
    return value;
}
function initGatewayConfig(userDataPath) {
    configFile = path_1.default.join(userDataPath, "gateway-config.json");
    const stored = readConfigFile();
    if (stored?.onlineApiUrl) {
        storedApiUrl = normalizeGatewayApiUrl(stored.onlineApiUrl);
        process.env.ONLINE_API_URL = storedApiUrl;
        return;
    }
    ensureDefaultGatewayConfig();
}
function ensureDefaultGatewayConfig() {
    const defaultUrl = getDefaultGatewayApiUrl();
    return setGatewayApiUrl(defaultUrl);
}
function readConfigFile() {
    if (!configFile || !fs_1.default.existsSync(configFile))
        return null;
    try {
        return JSON.parse(fs_1.default.readFileSync(configFile, "utf8"));
    }
    catch {
        return null;
    }
}
function getDefaultGatewayApiUrl() {
    return normalizeGatewayApiUrl(process.env.ONLINE_API_URL ?? DEFAULT_API_URL);
}
function getGatewayApiUrl() {
    return storedApiUrl ?? getDefaultGatewayApiUrl();
}
function setGatewayApiUrl(input) {
    const onlineApiUrl = normalizeGatewayApiUrl(input);
    storedApiUrl = onlineApiUrl;
    process.env.ONLINE_API_URL = onlineApiUrl;
    if (configFile) {
        fs_1.default.mkdirSync(path_1.default.dirname(configFile), { recursive: true });
        fs_1.default.writeFileSync(configFile, JSON.stringify({ onlineApiUrl, updatedAt: Date.now() }, null, 2), "utf8");
    }
    return onlineApiUrl;
}
