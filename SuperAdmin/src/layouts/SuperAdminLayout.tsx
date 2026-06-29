import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { authApi } from "../api/auth.api";
import { useProfileStore } from "../store/profileStore";
import { useNotificationStore } from "../store/notificationStore";
import "../styles/notifications.css";
import "../styles/super-admin-layout.css";

export default function SuperAdminLayout() {
  const { toasts, dismiss } = useNotificationStore();
  const hydrateFromApi = useProfileStore((state) => state.hydrateFromApi);

  useEffect(() => {
    authApi
      .me()
      .then((profile) => hydrateFromApi(profile))
      .catch(() => {
        /* sidebar keeps defaults */
      });
  }, [hydrateFromApi]);

  return (
    <div className="super-admin-layout">
      <Sidebar />
      <div className="super-admin-layout__content">
        <Outlet />
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`super-toast rounded-lg px-4 py-2 text-sm text-white shadow ${t.type === "error" ? "bg-red-600" : t.type === "success" ? "bg-emerald-600" : "bg-slate-800"}`}
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
