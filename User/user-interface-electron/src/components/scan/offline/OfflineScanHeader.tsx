import { StatusBadge } from "../../dashboard/StatusBadge";
import { GatewayStatusBadge } from "../../layout/GatewayStatusBadge";
import { useAppMode } from "../../../context/AppModeContext";
import { useWorkspaceStatus } from "../../../hooks/useWorkspaceStatus";
import type { ScanStepId } from "./scanOfflineData";

const SUBTITLES_ONLINE: Record<ScanStepId, string> = {
  select: "Choose a scanner or printer connected to this workstation.",
  configure: "Configure scan settings, file format, OCR, and save destination.",
  scan: "Start the scan and wait while your scanner captures the document.",
  preview: "Review the scanned document before saving.",
  save: "Review file details and save the scanned document.",
};

const SUBTITLES_OFFLINE: Record<ScanStepId, string> = {
  select: "Choose a scanner connected to this workstation.",
  configure: "Configure scan settings. Review locally and save to your device.",
  scan: "Start the scan and wait while your scanner captures the document.",
  preview: "Review the scanned document before saving it locally.",
  save: "Review file details and save the scanned document locally.",
};

export function OfflineScanHeader({ step }: { step: ScanStepId }) {
  const { isOnline } = useAppMode();
  const { scannerConnected, licenseActive } = useWorkspaceStatus();
  const scannerOk = scannerConnected;
  const licenseOk = licenseActive;
  const subtitles = isOnline ? SUBTITLES_ONLINE : SUBTITLES_OFFLINE;

  return (
    <header className="scan-offline-header">
      <div>
        <h1 className="scan-offline-header__title">
          {isOnline ? "Scan" : "Scan Management Console"}
        </h1>
        <p className="scan-offline-header__subtitle">{subtitles[step]}</p>
      </div>

      <div className="scan-offline-header__badges">
        {isOnline ? (
          <>
            <GatewayStatusBadge />
            <StatusBadge
              label={scannerOk ? "Scanner: Connected" : "Scanner: Disconnected"}
              icon="scan"
              active={scannerOk}
            />
            <StatusBadge
              label={licenseOk ? "License: Active" : "License: Expired"}
              icon="shieldCheck"
              active={licenseOk}
            />
          </>
        ) : (
          <>
            <span className="scan-offline-badge scan-offline-badge--warning">Offline Mode</span>
            <StatusBadge
              label={scannerOk ? "Scanner: Connected" : "Scanner: Disconnected"}
              icon="scan"
              active={scannerOk}
            />
            <span className="scan-offline-badge scan-offline-badge--neutral">Local Save Only</span>
          </>
        )}
      </div>
    </header>
  );
}
