import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearExplicitLogout } from "../lib/sessionFlags";
import type { UserRole } from "../types";

type AuthState = {
  accessToken: string | null;
  role: UserRole | null;
  userId: number | null;
  setSession: (p: { accessToken: string; role: UserRole; userId: number }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      userId: null,
      setSession: (payload) => {
        clearExplicitLogout();
        set(payload);
      },
      clearSession: () => set({ accessToken: null, role: null, userId: null }),
    }),
    {
      name: "bukolabs-superadmin-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        userId: state.userId,
      }),
    },
  ),
);
