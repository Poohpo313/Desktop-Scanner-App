import type { ReactNode } from "react";
import AdminLoginView from "../AdminLoginView";
import Sidebar from "../Sidebar";
import TopBar from "../TopBar";
import "../../styles/portal-modal.css";
import "../../styles/admin-console.css";

type Backdrop = "login" | "admin" | "none";
type BackdropAlign = "center" | "top";

type Props = {
  children: ReactNode;
  backdrop?: Backdrop;
  backdropAlign?: BackdropAlign;
  figmaId?: string;
  screen?: string;
  variant?: "figma" | "portal";
  adminTitle?: string;
  adminBreadcrumb?: { label: string; to?: string }[];
  adminActive?: "dashboard" | "users" | "keys" | "devices" | "help" | "settings";
  adminBody?: ReactNode;
};

export default function PortalScreen({
  children,
  backdrop = "login",
  backdropAlign = "center",
  figmaId,
  screen,
  variant = "figma",
  adminTitle,
  adminBreadcrumb,
  adminActive,
  adminBody,
}: Props) {
  const isOverlay = backdrop !== "none";

  return (
    <div data-figma-id={figmaId} data-screen={screen}>
      {backdrop === "login" && (
        <div className="portal-backdrop__scene" aria-hidden="true">
          <AdminLoginView variant="figma" />
        </div>
      )}
      {backdrop === "admin" && (
        <div className="portal-backdrop__scene" aria-hidden="true">
          <div className="admin-shell">
            <Sidebar variant="figma" />
            <div className="admin-shell__main">
              <TopBar
                homeHref="/admin-dashboard-2226-1193"
                showSessionWarning={false}
                breadcrumb={adminBreadcrumb ?? [{ label: "Home" }, { label: "Dashboard" }]}
              />
              {adminBody}
            </div>
          </div>
        </div>
      )}

      {isOverlay ? (
        <div
          className={`portal-backdrop ${
            backdropAlign === "top" ? "portal-backdrop--top" : "portal-backdrop--center"
          }`}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
