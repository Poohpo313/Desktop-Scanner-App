import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import "../styles/topbar.css";

type Props = {
  title: string;
  sectionLabel?: string;
  sectionActiveLabel?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  showLogout?: boolean;
  children?: ReactNode;
  variant?: "default" | "dashboard";
};

export default function TopBar({
  title,
  sectionLabel,
  sectionActiveLabel,
  subtitle = "Scanner Super Admin Pulse - Bukolabs.io",
  searchPlaceholder,
  showLogout = false,
  children,
  variant = "default",
}: Props) {
  const { logout } = useAuth();

  return (
    <header className={`admin-topbar admin-topbar--${variant}`}>
      <div className="admin-topbar__copy">
        <h1>{title}</h1>
        {sectionLabel && (
          <span className="admin-topbar__section">
            <span>{sectionLabel}</span>
            {sectionActiveLabel && (
              <>
                <span className="admin-topbar__section-separator">›</span>
                <span className="admin-topbar__section-active">{sectionActiveLabel}</span>
              </>
            )}
          </span>
        )}
        <p>{subtitle}</p>
      </div>

      <div className="admin-topbar__actions">
        {children}
        {searchPlaceholder && (
          <label className="admin-topbar__search">
            <span className="sr-only">Search</span>
            <img src="/assets/search-icon.svg" alt="" aria-hidden="true" />
            <input type="search" placeholder={searchPlaceholder} />
          </label>
        )}
        {showLogout && (
          <button
            type="button"
            onClick={logout}
            className="admin-topbar__logout"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
