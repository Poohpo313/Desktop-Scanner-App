import { AppErrorState } from "../../common/AppErrorState";
import type { ScannerDevice } from "./scanOfflineData";

type ScannerConnectionAlertProps = {
  scanners: ScannerDevice[];
  scannerId: string;
  onRetry: () => void;
  refreshing?: boolean;
  compact?: boolean;
};

export function ScannerConnectionAlert({
  scanners,
  scannerId,
  onRetry,
  refreshing = false,
  compact = false,
}: ScannerConnectionAlertProps) {
  const selected = scanners.find((scanner) => scanner.id === scannerId) ?? scanners[0] ?? null;
  const hasScanners = scanners.length > 0;
  const selectedReady = selected?.status === "ready";

  if (hasScanners && selectedReady) return null;

  const deviceLabel = selected?.name ?? "Scanner/printer";

  return (
    <AppErrorState
      variant="warning"
      title="Scanner/printer not connected"
      message={
        hasScanners
          ? `${deviceLabel} is not ready. Check power and cables, then retry the connection before continuing.`
          : "No scanner or printer was detected on this workstation. Connect your device, then retry the connection."
      }
      actionLabel={refreshing ? "Retrying…" : "Retry scanner/printer connection"}
      onAction={refreshing ? undefined : onRetry}
      compact={compact}
      className="scan-scanner-offline-notice"
    />
  );
}
