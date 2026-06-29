import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { ScannerDevice } from "../scanOfflineData";
import { ScanModalShell } from "./ScanModalShell";

type AvailableDevicesModalProps = {
  scanners: ScannerDevice[];
  value: string;
  refreshing: boolean;
  onRefresh: () => void;
  onApply: (scannerId: string) => void;
  onClose: () => void;
};

function connectionLabel(connection: string): string {
  if (connection.toLowerCase().startsWith("usb")) return "USB 2.0";
  return connection;
}

function DeviceCard({
  scanner,
  selected,
  onSelect,
}: {
  scanner: ScannerDevice;
  selected: boolean;
  onSelect: () => void;
}) {
  const connected = scanner.status === "ready";

  return (
    <button
      type="button"
      className={`available-devices-card${selected ? " available-devices-card--selected" : ""}${
        !connected ? " available-devices-card--offline" : ""
      }`}
      onClick={onSelect}
    >
      <span
        className={`available-devices-card__radio${selected ? " available-devices-card__radio--on" : ""}`}
        aria-hidden="true"
      />
      <span className="available-devices-card__copy">
        <span className="available-devices-card__name">{scanner.name}</span>
        <span className="available-devices-card__connection">{connectionLabel(scanner.connection)}</span>
      </span>
      <span
        className={`available-devices-card__badge available-devices-card__badge--${
          connected ? "connected" : "offline"
        }`}
      >
        <span className="available-devices-card__badge-dot" aria-hidden="true" />
        {connected ? "Connected" : "Offline"}
      </span>
    </button>
  );
}

export function AvailableDevicesModal({
  scanners,
  value,
  refreshing,
  onRefresh,
  onApply,
  onClose,
}: AvailableDevicesModalProps) {
  const [selectedId, setSelectedId] = useState(value);

  useEffect(() => {
    setSelectedId(value);
  }, [value]);

  const canContinue = selectedId.length > 0;

  return (
    <ScanModalShell
      title="Available Devices"
      subtitle="Select a scanner to continue."
      usePortal
      elevated
      onClose={onClose}
      footer={
        <div className="available-devices-modal__footer">
          <button
            type="button"
            className={`available-devices-modal__refresh scan-btn scan-btn--outline${
              refreshing ? " available-devices-modal__refresh--spinning" : ""
            }`}
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.8} />
            {refreshing ? "Refreshing…" : "Refresh Devices"}
          </button>
          <div className="available-devices-modal__footer-actions">
            <button type="button" className="scan-btn scan-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="scan-btn scan-btn--primary"
              disabled={!canContinue}
              onClick={() => onApply(selectedId)}
            >
              Continue
            </button>
          </div>
        </div>
      }
    >
      <div className="available-devices-modal__list">
        {scanners.map((scanner) => (
          <DeviceCard
            key={scanner.id}
            scanner={scanner}
            selected={scanner.id === selectedId}
            onSelect={() => setSelectedId(scanner.id)}
          />
        ))}
      </div>
    </ScanModalShell>
  );
}
