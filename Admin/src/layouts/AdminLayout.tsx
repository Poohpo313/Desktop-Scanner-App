import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AnimatedOutlet from "../components/AnimatedOutlet";
import { authApi } from "../api/auth.api";
import { useSessionKeepAlive } from "../hooks/useSessionKeepAlive";
import { useNotificationStore } from "../store/notificationStore";
import { useSettingsProfileStore } from "../store/settingsProfileStore";
import "../styles/admin-console.css";
import "../styles/portal-modal.css";
import "../styles/portal-pages.css";
import "../styles/page-transition.css";

export default function AdminLayout() {
  const { toasts, dismiss } = useNotificationStore();
  const hydrateFromApi = useSettingsProfileStore((state) => state.hydrateFromApi);

  useSessionKeepAlive();

  useEffect(() => {
    authApi
      .me()
      .then((profile) => hydrateFromApi(profile))
      .catch(() => {
        /* profile panel falls back to stored values */
      });
  }, [hydrateFromApi]);

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-shell__main">
        <AnimatedOutlet />
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg px-4 py-2 text-sm text-white shadow ${t.type === "error" ? "bg-red-600" : t.type === "success" ? "bg-emerald-600" : "bg-slate-800"}`}
              onClick={() => dismiss(t.id)}
            >
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
