import { StatusBadge } from "../dashboard/StatusBadge";
import { useWorkspaceStatus } from "../../hooks/useWorkspaceStatus";
import { OfflineConsoleHeader } from "./OfflineConsoleHeader";
import { getOfflineConsoleTitle } from "./offlineConsoleTitles";

export function OfflineDashboardHeader() {
  const { scannerConnected, licenseActive } = useWorkspaceStatus();

  return (
    <OfflineConsoleHeader
      title={getOfflineConsoleTitle("Dashboard")}
      badges={
        <>
          <StatusBadge
            label={scannerConnected ? "Scanner: Connected" : "Scanner: Disconnected"}
            icon="scan"
            active={scannerConnected}
          />
          <StatusBadge
            label={licenseActive ? "License: Active" : "License: Expired"}
            icon="shieldCheck"
            active={licenseActive}
          />
        </>
      }
    />
  );
}
