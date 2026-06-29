import fs from "fs";
import { networkInterfaces } from "node:os";
import path from "path";
import { normalizeGatewayApiUrl } from "./gateway-config.service";

const DEFAULT_PORT = 3000;
const FAST_PROBE_TIMEOUT_MS = 600;
const LAN_PROBE_TIMEOUT_MS = 900;
const SUBNET_BATCH_SIZE = 48;
const LAN_SCAN_BUDGET_MS = 12_000;

type EndpointFile = {
  urls?: string[];
};

function extractSubnetPrefix(ipv4: string): string | null {
  const parts = ipv4.split(".");
  if (parts.length !== 4) return null;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

function listLocalIpv4Addresses(): string[] {
  const addresses = new Set<string>();
  const interfaces = networkInterfaces();
  if (!interfaces) return [];

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.add(entry.address);
      }
    }
  }
  return Array.from(addresses);
}

function readSharedEndpointUrls(): string[] {
  const filePath = path.join(
    process.env.ProgramData ?? "C:\\ProgramData",
    "Bukolabs",
    "gateway",
    "endpoint.json",
  );

  if (!fs.existsSync(filePath)) return [];

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as EndpointFile;
    return (parsed.urls ?? []).map((url) => normalizeGatewayApiUrl(url));
  } catch {
    return [];
  }
}

export async function probeGatewayHealth(
  apiBaseUrl: string,
  timeoutMs = FAST_PROBE_TIMEOUT_MS,
): Promise<boolean> {
  const base = normalizeGatewayApiUrl(apiBaseUrl).replace(/\/+$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${base}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const payload = (await response.json()) as { status?: string };
    return payload.status === "ok";
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function buildTieredCandidates(preferredUrl: string | null | undefined, port = DEFAULT_PORT): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();

  function add(url: string | null | undefined) {
    if (!url?.trim()) return;
    const normalized = normalizeGatewayApiUrl(url);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    ordered.push(normalized);
  }

  add(preferredUrl ?? null);
  for (const shared of readSharedEndpointUrls()) add(shared);
  add(`http://localhost:${port}/api/v1`);
  add(`http://127.0.0.1:${port}/api/v1`);

  for (const address of listLocalIpv4Addresses()) {
    add(`http://${address}:${port}/api/v1`);
  }

  return ordered;
}

function buildSubnetCandidates(port = DEFAULT_PORT): string[] {
  const subnets = new Set<string>();
  for (const address of listLocalIpv4Addresses()) {
    const prefix = extractSubnetPrefix(address);
    if (prefix) subnets.add(prefix);
  }

  const candidates: string[] = [];
  for (const prefix of subnets) {
    for (let host = 1; host <= 254; host += 1) {
      candidates.push(normalizeGatewayApiUrl(`http://${prefix}.${host}:${port}/api/v1`));
    }
  }

  return candidates;
}

export async function discoverGatewayUrlFast(
  preferredUrl?: string | null,
  port = DEFAULT_PORT,
): Promise<string | null> {
  const candidates = buildTieredCandidates(preferredUrl, port);
  const results = await Promise.all(
    candidates.map(async (url) => ({
      url,
      ok: await probeGatewayHealth(url, FAST_PROBE_TIMEOUT_MS),
    })),
  );

  return results.find((entry) => entry.ok)?.url ?? null;
}

export async function discoverGatewayUrl(
  preferredUrl?: string | null,
  port = DEFAULT_PORT,
): Promise<string | null> {
  const fast = await discoverGatewayUrlFast(preferredUrl, port);
  if (fast) return fast;

  const tierOne = new Set(buildTieredCandidates(preferredUrl, port));
  const subnetCandidates = buildSubnetCandidates(port).filter((url) => !tierOne.has(url));
  const deadline = Date.now() + LAN_SCAN_BUDGET_MS;

  for (let index = 0; index < subnetCandidates.length; index += SUBNET_BATCH_SIZE) {
    if (Date.now() >= deadline) break;

    const batch = subnetCandidates.slice(index, index + SUBNET_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (url) => ({
        url,
        ok: await probeGatewayHealth(url, LAN_PROBE_TIMEOUT_MS),
      })),
    );
    const match = results.find((entry) => entry.ok);
    if (match) return match.url;
  }

  return null;
}
