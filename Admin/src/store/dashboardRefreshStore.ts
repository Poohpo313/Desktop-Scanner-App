import { create } from "zustand";

type DashboardRefreshState = {
  token: number;
  refreshing: boolean;
  bump: () => void;
};

export const useDashboardRefreshStore = create<DashboardRefreshState>((set, get) => ({
  token: 0,
  refreshing: false,
  bump: () => {
    if (get().refreshing) return;

    set({ refreshing: true, token: get().token + 1 });
    window.setTimeout(() => set({ refreshing: false }), 700);
  },
}));

export function isDashboardPath(pathname: string): boolean {
  return (
    pathname === "/portal/dashboard" ||
    pathname === "/admin-dashboard" ||
    pathname === "/admin-dashboard-2226-1193"
  );
}
