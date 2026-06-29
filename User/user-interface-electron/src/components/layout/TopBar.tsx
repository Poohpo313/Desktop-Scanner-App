import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { StatusBadge } from "../dashboard/StatusBadge";
import { GatewayStatusBadge } from "../layout/GatewayStatusBadge";
import { useAppMode } from "../../context/AppModeContext";
import { useWorkspaceStatus } from "../../hooks/useWorkspaceStatus";
import { useSidebar } from "../../context/SidebarContext";
import { getPageMeta } from "./pageMeta";
import { isConsolePageRoute } from "./consoleRoutes";

export function TopBar() {
  const { pathname } = useLocation();
  const { isOnline } = useAppMode();
  const { scannerConnected, printerConnected, licenseActive } = useWorkspaceStatus();
  const { toggleMobile } = useSidebar();
  const meta = getPageMeta(pathname);
  const isConsolePage = isConsolePageRoute(pathname, isOnline);
  const isScanPage = pathname === "/scan";

  const isPrintPage = pathname.startsWith("/print");
  const scannerOk = scannerConnected;
  const printerOk = printerConnected;
  const licenseOk = licenseActive;
  const showTopBarStatusBadges = !isScanPage && !isConsolePage;

  return (
    <header className={`dash-topbar${isConsolePage ? " dash-topbar--dashboard" : ""}`}>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6e9f1] text-slate-600 transition-colors hover:border-[#008768] hover:text-[#008768] md:hidden"
          onClick={toggleMobile}
          aria-label="Open navigation menu"
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
        {!isConsolePage && <h2 className="dash-topbar__title">{meta.title}</h2>}
      </div>

      {showTopBarStatusBadges ? (
        <div className="dash-topbar__actions">
          {isOnline ? <GatewayStatusBadge /> : null}
          <StatusBadge
            label={scannerOk ? "Scanner Connected" : "Scanner Disconnected"}
            icon="scan"
            active={scannerOk}
          />
          {isPrintPage ? (
            <StatusBadge
              label={printerOk ? "Printer Connected" : "Printer Disconnected"}
              icon="print"
              active={printerOk}
            />
          ) : null}
          <StatusBadge
            label={licenseOk ? "License Active" : "License Expired"}
            icon="shieldCheck"
            active={licenseOk}
          />
        </div>
      ) : null}
    </header>
  );
}
