import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearExplicitLogout } from "../lib/sessionFlags";
import type { UserRole } from "../types";

type AuthState = {
  accessToken: string | null;
  role: UserRole | null;
  userId: number | null;
  setSession: (payload: { accessToken: string; role: UserRole; userId: number }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      userId: null,
      setSession: ({ accessToken, role, userId }) => {
        clearExplicitLogout();
        set({ accessToken, role, userId });
      },
      clearSession: () => set({ accessToken: null, role: null, userId: null }),
    }),
    {
      name: "bukolabs-admin-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        userId: state.userId,
      }),
    },
  ),
);
