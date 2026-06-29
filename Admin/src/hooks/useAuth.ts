import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { markExplicitLogout } from "../lib/sessionFlags";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const navigate = useNavigate();
  const { accessToken, role, userId, setSession, clearSession } = useAuthStore();

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* cookie cleared server-side if configured */
    }
    markExplicitLogout();
    clearSession();
    navigate("/portal/login", { replace: true });
  }, [clearSession, navigate]);

  return { accessToken, role, userId, setSession, logout, isAuthenticated: !!accessToken };
}
