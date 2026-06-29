"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.probeGatewayHealth = probeGatewayHealth;
exports.discoverGatewayUrlFast = discoverGatewayUrlFast;
exports.discoverGatewayUrl = discoverGatewayUrl;
const fs_1 = __importDefault(require("fs"));
const node_os_1 = require("node:os");
const path_1 = __importDefault(require("path"));
const gateway_config_service_1 = require("./gateway-config.service");
const DEFAULT_PORT = 3000;
const FAST_PROBE_TIMEOUT_MS = 600;
const LAN_PROBE_TIMEOUT_MS = 900;
const SUBNET_BATCH_SIZE = 48;
const LAN_SCAN_BUDGET_MS = 12_000;
function extractSubnetPrefix(ipv4) {
    const parts = ipv4.split(".");
    if (parts.length !== 4)
        return null;
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
}
function listLocalIpv4Addresses() {
    const addresses = new Set();
    const interfaces = (0, node_os_1.networkInterfaces)();
    if (!interfaces)
        return [];
    for (const entries of Object.values(interfaces)) {
        for (const entry of entries ?? []) {
            if (entry.family === "IPv4" && !entry.internal) {
                addresses.add(entry.address);
            }
        }
    }
    return Array.from(addresses);
}
function readSharedEndpointUrls() {
    const filePath = path_1.default.join(process.env.ProgramData ?? "C:\\ProgramData", "Bukolabs", "gateway", "endpoint.json");
    if (!fs_1.default.existsSync(filePath))
        return [];
    try {
        const parsed = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
        return (parsed.urls ?? []).map((url) => (0, gateway_config_service_1.normalizeGatewayApiUrl)(url));
    }
    catch {
        return [];
    }
}
async function probeGatewayHealth(apiBaseUrl, timeoutMs = FAST_PROBE_TIMEOUT_MS) {
    const base = (0, gateway_config_service_1.normalizeGatewayApiUrl)(apiBaseUrl).replace(/\/+$/, "");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(`${base}/health`, {
            method: "GET",
            signal: controller.signal,
        });
        if (!response.ok)
            return false;
        const payload = (await response.json());
        return payload.status === "ok";
    }
    catch {
        return false;
    }
    finally {
        clearTimeout(timer);
    }
}
function buildTieredCandidates(preferredUrl, port = DEFAULT_PORT) {
    const ordered = [];
    const seen = new Set();
    function add(url) {
        if (!url?.trim())
            return;
        const normalized = (0, gateway_config_service_1.normalizeGatewayApiUrl)(url);
        if (seen.has(normalized))
            return;
        seen.add(normalized);
        ordered.push(normalized);
    }
    add(preferredUrl ?? null);
    for (const shared of readSharedEndpointUrls())
        add(shared);
    add(`http://localhost:${port}/api/v1`);
    add(`http://127.0.0.1:${port}/api/v1`);
    for (const address of listLocalIpv4Addresses()) {
        add(`http://${address}:${port}/api/v1`);
    }
    return ordered;
}
function buildSubnetCandidates(port = DEFAULT_PORT) {
    const subnets = new Set();
    for (const address of listLocalIpv4Addresses()) {
        const prefix = extractSubnetPrefix(address);
        if (prefix)
            subnets.add(prefix);
    }
    const candidates = [];
    for (const prefix of subnets) {
        for (let host = 1; host <= 254; host += 1) {
            candidates.push((0, gateway_config_service_1.normalizeGatewayApiUrl)(`http://${prefix}.${host}:${port}/api/v1`));
        }
    }
    return candidates;
}
async function discoverGatewayUrlFast(preferredUrl, port = DEFAULT_PORT) {
    const candidates = buildTieredCandidates(preferredUrl, port);
    const results = await Promise.all(candidates.map(async (url) => ({
        url,
        ok: await probeGatewayHealth(url, FAST_PROBE_TIMEOUT_MS),
    })));
    return results.find((entry) => entry.ok)?.url ?? null;
}
async function discoverGatewayUrl(preferredUrl, port = DEFAULT_PORT) {
    const fast = await discoverGatewayUrlFast(preferredUrl, port);
    if (fast)
        return fast;
    const tierOne = new Set(buildTieredCandidates(preferredUrl, port));
    const subnetCandidates = buildSubnetCandidates(port).filter((url) => !tierOne.has(url));
    const deadline = Date.now() + LAN_SCAN_BUDGET_MS;
    for (let index = 0; index < subnetCandidates.length; index += SUBNET_BATCH_SIZE) {
        if (Date.now() >= deadline)
            break;
        const batch = subnetCandidates.slice(index, index + SUBNET_BATCH_SIZE);
        const results = await Promise.all(batch.map(async (url) => ({
            url,
            ok: await probeGatewayHealth(url, LAN_PROBE_TIMEOUT_MS),
        })));
        const match = results.find((entry) => entry.ok);
        if (match)
            return match.url;
    }
    return null;
}
