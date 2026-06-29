import { useEffect } from "react";
import { authApi } from "../api/auth.api";
import { useAuth } from "./useAuth";

const KEEP_ALIVE_MS = 7 * 60 * 1000;

export function useSessionKeepAlive() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const refresh = () => {
      if (cancelled || document.visibilityState === "hidden") return;
      authApi.refresh().catch(() => {
        /* axios interceptor handles definitive auth failures */
      });
    };

    refresh();
    const intervalId = window.setInterval(refresh, KEEP_ALIVE_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAuthenticated]);
}
