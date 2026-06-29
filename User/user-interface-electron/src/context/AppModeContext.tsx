import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type AppMode = "online" | "offline";

const STORAGE_KEY = "bukolabs.appMode";

const AppModeContext = createContext<{
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isOnline: boolean;
} | null>(null);

function hasBrowserNetwork(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

function readStoredMode(): AppMode {
  try {
    if (!hasBrowserNetwork()) return "offline";
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "offline" || stored === "online") return stored;
    return "online";
  } catch {
    return hasBrowserNetwork() ? "online" : "offline";
  }
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(readStoredMode);

  const setMode = useCallback((next: AppMode) => {
    sessionStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
  }, []);

  useEffect(() => {
    function handleOffline() {
      sessionStorage.setItem(STORAGE_KEY, "offline");
      setModeState("offline");
    }

    window.addEventListener("offline", handleOffline);
    if (!hasBrowserNetwork()) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AppModeContext.Provider value={{ mode, setMode, isOnline: mode === "online" }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error("useAppMode must be used within AppModeProvider");
  return ctx;
}
