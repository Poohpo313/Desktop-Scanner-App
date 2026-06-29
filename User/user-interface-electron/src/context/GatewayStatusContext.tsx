import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppMode } from "./AppModeContext";

const POLL_INTERVAL_MS = 45_000;

type GatewayStatusContextValue = {
  reachable: boolean | null;
  gatewayUrl: string | null;
  checking: boolean;
  checkNow: () => Promise<boolean>;
};

const GatewayStatusContext = createContext<GatewayStatusContextValue | null>(null);

export function GatewayStatusProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useAppMode();
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [gatewayUrl, setGatewayUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const mountedRef = useRef(true);

  const checkNow = useCallback(async () => {
    if (!window.bukolabs?.gateway) {
      if (mountedRef.current) {
        setReachable(false);
        setGatewayUrl(null);
      }
      return false;
    }

    setChecking(true);
    try {
      const result = await window.bukolabs.gateway.checkAvailable();
      if (!mountedRef.current) return result.reachable;
      setReachable(result.reachable);
      setGatewayUrl(result.url);
      return result.reachable;
    } catch {
      if (mountedRef.current) {
        setReachable(false);
      }
      return false;
    } finally {
      if (mountedRef.current) {
        setChecking(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setReachable(null);
      return;
    }

    void checkNow();
    const timer = window.setInterval(() => {
      void checkNow();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isOnline, checkNow]);

  return (
    <GatewayStatusContext.Provider value={{ reachable, gatewayUrl, checking, checkNow }}>
      {children}
    </GatewayStatusContext.Provider>
  );
}

export function useGatewayStatus() {
  const ctx = useContext(GatewayStatusContext);
  if (!ctx) {
    throw new Error("useGatewayStatus must be used within GatewayStatusProvider");
  }
  return ctx;
}
