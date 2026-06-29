import { create } from "zustand";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

type NotificationState = {
  toasts: Toast[];
  push: (message: string, type?: Toast["type"]) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;
const TOAST_DURATION = 3000;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],
  push: (message, type = "info") => {
    const alreadyShowing = get().toasts.some(
      (toast) => toast.message === message && toast.type === type,
    );

    if (alreadyShowing) return;

    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    window.setTimeout(() => get().dismiss(id), TOAST_DURATION);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
