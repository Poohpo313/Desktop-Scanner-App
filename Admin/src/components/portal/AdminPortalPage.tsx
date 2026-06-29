import type { ReactNode } from "react";
import { useCallback } from "react";
import Sidebar from "../Sidebar";
import TopBar from "../TopBar";
import ScreenRefreshFrame from "../ScreenRefreshFrame";
import { useTopBarRefresh } from "../../hooks/useTopBarRefresh";
import { useDashboardRefreshStore } from "../../store/dashboardRefreshStore";
import "../../styles/admin-console.css";
import "../../styles/page-transition.css";

type Crumb = { label: string; to?: string };

type Props = {
  figmaId: string;
  screen: string;
  breadcrumb: Crumb[];
  children: ReactNode | ((ctx: { refreshToken: number; onRefresh: () => void; refreshing: boolean }) => ReactNode);
  homeHref?: string;
  onRefreshData?: () => void | Promise<void>;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showTopBar?: boolean;
  showHeaderUtilities?: boolean;
  showHeaderRefreshOnly?: boolean;
  headerActions?: ReactNode;
};

function refreshMessageForScreen(screen: string): string {
  if (screen.includes("user-management")) return "User list refreshed";
  if (screen.includes("user-details")) return "User details refreshed";
  if (screen.includes("license-key")) return "Serial keys refreshed";
  if (screen.includes("device-management")) return "Devices refreshed";
  if (screen.includes("provision-device")) return "Provision device refreshed";
  if (screen.includes("help-and-support") || screen.includes("help")) return "Help center refreshed";
  if (screen === "settings") return "Settings refreshed";
  if (screen.includes("activity-logs")) return "Activity logs refreshed";
  if (screen.includes("notifications-center")) return "Notifications refreshed";
  if (screen.includes("admin-dashboard")) return "Dashboard refreshed";
  return "Page refreshed";
}

function isDashboardScreen(screen: string): boolean {
  return screen.includes("admin-dashboard");
}

export default function AdminPortalPage({
  figmaId,
  screen,
  breadcrumb,
  children,
  homeHref = "/admin-dashboard-2226-1193",
  onRefreshData,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  showTopBar = true,
  showHeaderUtilities = true,
  showHeaderRefreshOnly = false,
  headerActions,
}: Props) {
  const bumpDashboard = useDashboardRefreshStore((s) => s.bump);

  const refreshFn = useCallback(async () => {
    if (isDashboardScreen(screen)) {
      bumpDashboard();
    }
    await onRefreshData?.();
  }, [bumpDashboard, onRefreshData, screen]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(
    refreshFn,
    refreshMessageForScreen(screen)
  );

  return (
    <div data-figma-id={figmaId} data-screen={screen}>
      <div className="admin-shell admin-shell--figma">
        <Sidebar variant="figma" />
        <div className="admin-shell__main">
          {showTopBar ? (
            <TopBar
              homeHref={homeHref}
              showSessionWarning={false}
              breadcrumb={breadcrumb}
              searchPlaceholder={searchPlaceholder ?? "Search system resources..."}
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              onRefresh={onRefresh}
              refreshing={refreshing}
              headerVariant={isDashboardScreen(screen) ? "dashboard" : "default"}
              showUtilities={showHeaderUtilities}
              showRefreshOnly={showHeaderRefreshOnly}
              headerActions={headerActions}
            />
          ) : null}
          <ScreenRefreshFrame refreshToken={refreshToken}>
            {typeof children === "function"
              ? children({ refreshToken, onRefresh, refreshing })
              : children}
          </ScreenRefreshFrame>
        </div>
      </div>
    </div>
  );
}
