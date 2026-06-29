import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import { wasExplicitLogout } from "../lib/sessionFlags";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, setSession } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const [bootstrapping, setBootstrapping] = useState(true);

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
          if (session.role !== "admin") return;
          setSession({
            accessToken: session.accessToken,
            role: "admin",
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
        if (cancelled || session.role !== "admin") return;
        setSession({
          accessToken: session.accessToken,
          role: "admin",
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
    return <div className="admin-shell__content portal-empty-state">Loading session…</div>;
  }

  if (wasExplicitLogout() || !isAuthenticated) return <Navigate to="/portal/login" replace />;
  if (role && role !== "admin") return <Navigate to="/portal/login" replace />;
  return <>{children}</>;
}
