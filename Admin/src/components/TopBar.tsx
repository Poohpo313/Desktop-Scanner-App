import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import { IconHeaderBell, IconHeaderRefresh, IconSearch } from "./icons/AdminIcons";
import { useNotificationStore } from "../store/notificationStore";
import { isDashboardPath, useDashboardRefreshStore } from "../store/dashboardRefreshStore";
import "../styles/admin-console.css";

type Breadcrumb = { label: string; to?: string };

type Props = {
  breadcrumb?: Breadcrumb[];
  homeHref?: string;
  showSessionWarning?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  headerVariant?: "default" | "dashboard";
  showUtilities?: boolean;
  showRefreshOnly?: boolean;
  headerActions?: ReactNode;
};

const DEFAULT_BREADCRUMB: Breadcrumb[] = [{ label: "Home" }, { label: "Dashboard" }];

export default function TopBar({
  breadcrumb = DEFAULT_BREADCRUMB,
  homeHref = "/portal/dashboard",
  showSessionWarning = true,
  searchPlaceholder = "Search system resources...",
  searchValue,
  onSearchChange,
  onRefresh,
  refreshing: refreshingProp,
  headerVariant = "default",
  showUtilities = true,
  showRefreshOnly = false,
  headerActions,
}: Props) {
  const { warning } = useSessionTimeout();
  const location = useLocation();
  const push = useNotificationStore((s) => s.push);
  const bumpDashboard = useDashboardRefreshStore((s) => s.bump);
  const storeRefreshing = useDashboardRefreshStore((s) => s.refreshing);
  const onDashboard = isDashboardPath(location.pathname);
  const refreshing = refreshingProp ?? storeRefreshing;

  const handleRefresh = () => {
    if (refreshing) return;

    if (onRefresh) {
      onRefresh();
      return;
    }

    if (onDashboard) {
      bumpDashboard();
      push("Dashboard refreshed", "success");
    }
  };

  const canRefresh = Boolean(onRefresh || onDashboard);
  const isDashboardHeader = headerVariant === "dashboard";

  return (
    <header
      className={`admin-header${isDashboardHeader ? " admin-header--dashboard" : ""}${!showUtilities ? " admin-header--titles-only" : ""}${showRefreshOnly ? " admin-header--refresh-only" : ""}${headerActions ? " admin-header--page-actions" : ""}`}
    >
      <div className="admin-header__titles">
        <h1 className="admin-header__title">Desktop Scanner Officer Console</h1>
        <nav className="admin-header__breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} style={{ display: "contents" }}>
              {i > 0 && <span className="admin-header__breadcrumb-sep" aria-hidden="true">&gt;</span>}
              {crumb.to && i < breadcrumb.length - 1 ? (
                <Link to={crumb.to}>{crumb.label}</Link>
              ) : i === 0 && !crumb.to ? (
                <Link to={homeHref}>{crumb.label}</Link>
              ) : (
                <span className="admin-header__breadcrumb-current">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {showRefreshOnly ? (
        <div className="admin-header__refresh-wrap">
          <button
            type="button"
            className={`admin-header__refresh-btn${refreshing ? " admin-header__refresh-btn--spinning" : ""}`}
            aria-label="Refresh page"
            onClick={handleRefresh}
            disabled={refreshing || !canRefresh}
          >
            <IconHeaderRefresh />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      ) : headerActions ? (
        <div className="admin-header__page-actions">{headerActions}</div>
      ) : showUtilities ? (
        <div className="admin-header__search-wrap">
          <label className="admin-header__search">
            <IconSearch />
            <input
              type="search"
              placeholder={searchPlaceholder}
              aria-label="Search"
              {...(searchValue !== undefined ? { value: searchValue } : {})}
              onChange={(event) => onSearchChange?.(event.target.value)}
            />
          </label>
          {!isDashboardHeader && (
            <button
              type="button"
              className={`admin-header__icon-btn admin-header__icon-btn--refresh${refreshing ? " admin-header__icon-btn--spinning" : ""}`}
              aria-label={onDashboard && !onRefresh ? "Refresh dashboard" : "Refresh page"}
              onClick={handleRefresh}
              disabled={refreshing || !canRefresh}
            >
              <IconHeaderRefresh />
            </button>
          )}
        </div>
      ) : null}

      {showUtilities && !isDashboardHeader ? (
        <div className="admin-header__actions">
          {showSessionWarning && warning && (
            <span className="admin-header__session-warn">Session expiring in 1 minute</span>
          )}
          <button type="button" className="admin-header__icon-btn" aria-label="Notifications">
            <IconHeaderBell />
          </button>
          <div className="admin-header__profile">
            <img
              className="admin-header__profile-photo"
              src=""
              alt=""
            />
            <span className="admin-header__profile-name" title="Admin User">
              Admin User
            </span>
          </div>
        </div>
      ) : null}
    </header>
  );
}
