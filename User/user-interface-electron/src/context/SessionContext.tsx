import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { APP_STORAGE_KEYS } from "../config/appStorage";
import { applyAppTheme } from "../lib/appTheme";
import { ensureUserStorageRoot } from "../lib/ensureUserStorage";
import { resolveSettings } from "../lib/settingsStorage";

type SessionState = {
  token: string | null;
  userId: number | null;
  role: string | null;
  displayName?: string | null;
  freshWorkspace?: boolean;
};

const empty: SessionState = {
  token: null,
  userId: null,
  role: null,
  displayName: null,
  freshWorkspace: false,
};

export type SaveSessionInput = {
  token: string;
  userId: number;
  role: string;
  displayName?: string;
  freshWorkspace?: boolean;
};

function loadStored(): SessionState {
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEYS.session);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { ...empty };
}

function persist(session: SessionState) {
  if (session.token) localStorage.setItem(APP_STORAGE_KEYS.session, JSON.stringify(session));
  else localStorage.removeItem(APP_STORAGE_KEYS.session);
}

const SessionContext = createContext<{
  session: SessionState;
  saveSession: (data: SaveSessionInput) => void;
  markWorkspaceUsed: () => void;
  clearSession: () => void;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(loadStored);
  const navigate = useNavigate();

  const saveSession = useCallback((data: SaveSessionInput) => {
    const next: SessionState = {
      ...data,
      displayName: data.displayName ?? null,
      freshWorkspace: data.freshWorkspace ?? false,
    };
    setSession(next);
    persist(next);
    applyAppTheme(resolveSettings(next.userId).theme);
  }, []);

  const markWorkspaceUsed = useCallback(() => {
    setSession((current) => {
      if (!current.token || !current.freshWorkspace) return current;
      const next = { ...current, freshWorkspace: false };
      persist(next);
      return next;
    });
  }, []);

  const clearSession = useCallback(() => {
    setSession({ ...empty });
    persist({ ...empty });
    applyAppTheme("Light");
  }, []);

  useEffect(() => {
    if (!session.token) return;

    async function validateSession() {
      const result = await window.bukolabs?.auth.checkSession({ token: session.token! });
      if (!result?.valid) {
        clearSession();
        navigate("/login", { replace: true });
      }
    }

    void validateSession();
    const interval = setInterval(() => {
      void validateSession();
    }, 30_000);
    return () => clearInterval(interval);
  }, [session.token, clearSession, navigate]);

  useEffect(() => {
    if (session.userId == null) return;
    void ensureUserStorageRoot(session.userId);
  }, [session.userId]);

  useEffect(() => {
    if (!session.token || session.userId == null || !session.displayName) return;

    const syncDevices = () => {
      void window.bukolabs?.devices.syncForUser({
        userId: session.userId!,
        username: session.displayName!,
      });
    };

    syncDevices();
    const interval = setInterval(syncDevices, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session.token, session.userId, session.displayName]);

  return (
    <SessionContext.Provider value={{ session, saveSession, markWorkspaceUsed, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
