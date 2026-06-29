import fs from "fs";
import path from "path";

const DEFAULT_API_URL = "http://localhost:3000/api/v1";

type GatewayConfigFile = {
  onlineApiUrl: string;
  updatedAt: number;
};

let configFile: string | null = null;
let storedApiUrl: string | null = null;

export function normalizeGatewayApiUrl(input: string): string {
  let value = input.trim();
  if (!value) return DEFAULT_API_URL;

  if (!/^https?:\/\//i.test(value)) {
    value = `http://${value}`;
  }

  value = value.replace(/\/+$/, "");

  if (!/\/api\/v1$/i.test(value)) {
    value = `${value}/api/v1`;
  }

  return value;
}

export function initGatewayConfig(userDataPath: string) {
  configFile = path.join(userDataPath, "gateway-config.json");
  const stored = readConfigFile();
  if (stored?.onlineApiUrl) {
    storedApiUrl = normalizeGatewayApiUrl(stored.onlineApiUrl);
    process.env.ONLINE_API_URL = storedApiUrl;
    return;
  }

  ensureDefaultGatewayConfig();
}

export function ensureDefaultGatewayConfig() {
  const defaultUrl = getDefaultGatewayApiUrl();
  return setGatewayApiUrl(defaultUrl);
}

function readConfigFile(): GatewayConfigFile | null {
  if (!configFile || !fs.existsSync(configFile)) return null;

  try {
    return JSON.parse(fs.readFileSync(configFile, "utf8")) as GatewayConfigFile;
  } catch {
    return null;
  }
}

export function getDefaultGatewayApiUrl() {
  return normalizeGatewayApiUrl(process.env.ONLINE_API_URL ?? DEFAULT_API_URL);
}

export function getGatewayApiUrl() {
  return storedApiUrl ?? getDefaultGatewayApiUrl();
}

export function setGatewayApiUrl(input: string) {
  const onlineApiUrl = normalizeGatewayApiUrl(input);
  storedApiUrl = onlineApiUrl;
  process.env.ONLINE_API_URL = onlineApiUrl;

  if (configFile) {
    fs.mkdirSync(path.dirname(configFile), { recursive: true });
    fs.writeFileSync(
      configFile,
      JSON.stringify({ onlineApiUrl, updatedAt: Date.now() } satisfies GatewayConfigFile, null, 2),
      "utf8",
    );
  }

  return onlineApiUrl;
}
