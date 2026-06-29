import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppMode } from "../context/AppModeContext";
import { SidebarProvider } from "../context/SidebarContext";
import { useSession } from "../context/SessionContext";
import { canAccessRoute } from "../lib/rolePermissions";
import { SyncTracker } from "./layout/SyncTracker";
import { NetworkMonitor } from "./layout/NetworkMonitor";
import { AppFooter } from "./layout/AppFooter";
import { Breadcrumb } from "./layout/Breadcrumb";
import { isConsolePageRoute } from "./layout/consoleRoutes";
import { TopBar } from "./layout/TopBar";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const { session } = useSession();
  const { isOnline } = useAppMode();
  const { pathname } = useLocation();

  if (!session.token) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessRoute(session.role, pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  const isScanPage = pathname === "/scan";
  const isSearchPage = pathname === "/search";
  const isFilesPage = pathname === "/files";
  const isDevicesPage = pathname === "/devices";
  const isSettingsPage = pathname === "/settings" || pathname.startsWith("/settings/");
  const isAboutPage = pathname === "/help";
  const isCloudPage = pathname === "/cloud";
  const isHelpAssistantPage = pathname === "/help-assistant";
  const isPrintPage = pathname === "/print" || pathname.startsWith("/print/");
  const isFullscreenMain = !isOnline;
  const isScanFullscreen = isScanPage;
  const isDashboard = isConsolePageRoute(pathname, isOnline);

  return (
    <SidebarProvider>
      <SyncTracker />
      <NetworkMonitor />
      <div className={`app-shell${isFullscreenMain ? " app-shell--split-scroll" : ""}`}>
        <Sidebar scrollable={isFullscreenMain} />
        <div
          className={
            isFullscreenMain
              ? "app-shell__body app-shell__body--split"
              : "app-shell__body pl-0 md:pl-[72px] lg:pl-60"
          }
        >
          <TopBar />
          {!isDashboard && <Breadcrumb />}
          <main
            className={`app-shell__main app-shell__main--flush${
              isFullscreenMain || isScanFullscreen || isSearchPage || isFilesPage || isDevicesPage || isSettingsPage || isAboutPage || isCloudPage || isHelpAssistantPage || isPrintPage
                ? " app-shell__main--fullscreen"
                : ""
            }`}
          >
            <Outlet />
          </main>
          {!isDashboard && <AppFooter />}
        </div>
      </div>
    </SidebarProvider>
  );
}
