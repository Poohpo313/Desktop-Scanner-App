import { useEffect, useState } from "react";
import "../../styles/gateway-server-panel.css";

type GatewayConfig = {
  url: string;
  defaultUrl: string;
};

function displayGatewayHost(url: string) {
  try {
    const parsed = new URL(url);
    const defaultPort = parsed.protocol === "https:" ? "443" : "80";
    const portSuffix = parsed.port && parsed.port !== defaultPort ? `:${parsed.port}` : "";
    const pathSuffix = parsed.pathname && parsed.pathname !== "/api/v1" ? parsed.pathname : "";
    return `${parsed.hostname}${portSuffix}${pathSuffix}`;
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/\/api\/v1\/?$/i, "");
  }
}

function toInputValue(url: string) {
  return displayGatewayHost(url);
}

type Props = {
  compact?: boolean;
  onConnected?: () => void;
  onContinueOffline?: () => void;
};

export function GatewayServerPanel({ compact = false, onConnected, onContinueOffline }: Props) {
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      if (!window.bukolabs?.gateway) return;
      const result = await window.bukolabs.gateway.getConfig();
      if (cancelled) return;
      setConfig(result);
      setInput(toInputValue(result.url));
    }

    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  async function testConnection(nextUrl?: string) {
    if (!window.bukolabs?.gateway) return false;

    setBusy(true);
    setError(null);
    setStatus("Testing connection to the gateway...");

    try {
      if (nextUrl != null && nextUrl !== toInputValue(config?.url ?? "")) {
        const saved = await window.bukolabs.gateway.setUrl({ url: nextUrl });
        setConfig((current) => ({
          url: saved.url,
          defaultUrl: current?.defaultUrl ?? saved.url,
        }));
        setInput(toInputValue(saved.url));
        if (saved.reachable) {
          setStatus("Gateway connected.");
          onConnected?.();
          return true;
        }
      }

      const check = await window.bukolabs.gateway.checkAvailable();
      setConfig((current) => ({
        url: check.url,
        defaultUrl: current?.defaultUrl ?? check.url,
      }));
      setInput(toInputValue(check.url));

      if (check.reachable) {
        setStatus("Gateway connected.");
        onConnected?.();
        return true;
      }

      setError(
        "Could not reach the gateway. Enter your office LAN IP (for example 192.168.1.50:3000) or your cloud gateway URL (for example gateway.yourcompany.com or https://api.yourcompany.com).",
      );
      setStatus(null);
      return false;
    } catch {
      setError("Could not test the gateway connection.");
      setStatus(null);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    await testConnection(input.trim());
  }

  return (
    <div className={`gateway-server-panel${compact ? " gateway-server-panel--compact" : ""}`}>
      <h2 className="gateway-server-panel__title">Gateway Server</h2>
      <p className="gateway-server-panel__hint">
        Point this app at the Bukolabs gateway server. Use a LAN IP when users are on the same network,
        or a public domain / HTTPS URL when users connect from different locations and Wi‑Fi networks.
        Do not use <code>localhost</code> on other devices.
      </p>

      <label className="gateway-server-panel__field">
        <span className="gateway-server-panel__label">Server address</span>
        <input
          className="gateway-server-panel__input"
          type="text"
          value={input}
          placeholder="192.168.1.50:3000 or gateway.yourcompany.com"
          disabled={busy}
          onChange={(event) => {
            setInput(event.target.value);
            setError(null);
            setStatus(null);
          }}
        />
      </label>

      {status ? <p className="gateway-server-panel__status">{status}</p> : null}
      {error ? <p className="gateway-server-panel__error">{error}</p> : null}

      <div className="gateway-server-panel__actions">
        <button type="button" className="login__button" disabled={busy} onClick={() => void handleSave()}>
          {busy ? "Testing..." : "Test Connection"}
        </button>
        {onContinueOffline ? (
          <button
            type="button"
            className="login__button login__button--outline"
            disabled={busy}
            onClick={onContinueOffline}
          >
            Continue Offline
          </button>
        ) : null}
      </div>
    </div>
  );
}
