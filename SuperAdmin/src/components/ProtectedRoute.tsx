import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import { wasExplicitLogout } from "../lib/sessionFlags";
import { useAuthStore } from "../store/authStore";

function initialBootstrapping() {
  if (!useAuthStore.persist.hasHydrated()) return true;
  if (wasExplicitLogout()) return false;
  return !useAuthStore.getState().accessToken;
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, setSession } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const [bootstrapping, setBootstrapping] = useState(initialBootstrapping);

  useEffect(() => {
    if (hasHydrated) return;
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (wasExplicitLogout()) {
      setBootstrapping(false);
      return;
    }

    if (isAuthenticated) {
      setBootstrapping(false);
      authApi
        .refresh()
        .then((session) => {
          if (session.role !== "superadmin") return;
          setSession({
            accessToken: session.accessToken,
            role: "superadmin",
            userId: session.userId,
          });
        })
        .catch(() => {
          /* keep persisted session when refresh is unavailable */
        });
      return;
    }

    let cancelled = false;

    authApi
      .refresh()
      .then((session) => {
        if (cancelled || session.role !== "superadmin") return;
        setSession({
          accessToken: session.accessToken,
          role: "superadmin",
          userId: session.userId,
        });
      })
      .catch(() => {
        /* no refresh cookie */
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, setSession]);

  if (!hasHydrated || bootstrapping) {
    return <div className="portal-empty-state">Loading session…</div>;
  }

  if (wasExplicitLogout() || !isAuthenticated) return <Navigate to="/portal/login" replace />;
  if (role && role !== "superadmin") return <Navigate to="/portal/login" replace />;
  return <>{children}</>;
}
