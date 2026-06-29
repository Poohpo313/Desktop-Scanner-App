import { ArrowRight, RefreshCw, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppErrorState } from "../../../common/AppErrorState";
import type { ScannerDevice } from "../scanOfflineData";

type SelectScannerStepProps = {
  isOnline: boolean;
  scanners: ScannerDevice[];
  selectedId: string;
  refreshing: boolean;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  onNext: () => void;
};

function ScannerCard({
  scanner,
  selected,
  onSelect,
}: {
  scanner: ScannerDevice;
  selected: boolean;
  onSelect: () => void;
}) {
  const ready = scanner.status === "ready";

  return (
    <button
      type="button"
      className={`scan-scanner-card${selected ? " scan-scanner-card--selected" : ""}${
        !ready ? " scan-scanner-card--offline" : ""
      }`}
      onClick={onSelect}
    >
      <span className={`scan-scanner-card__radio${selected ? " scan-scanner-card__radio--on" : ""}`} />
      <ScanLine className="scan-scanner-card__icon" strokeWidth={1.8} />
      <span className="scan-scanner-card__body">
        <span className="scan-scanner-card__name">{scanner.name}</span>
        <span className="scan-scanner-card__type">{scanner.type}</span>
        <span className={`scan-scanner-card__status scan-scanner-card__status--${scanner.status}`}>
          <span className="scan-scanner-card__status-dot" />
          {ready ? "Ready" : "Offline"} — {scanner.connection}
        </span>
      </span>
    </button>
  );
}

export function SelectScannerStep({
  isOnline,
  scanners,
  selectedId,
  refreshing,
  onSelect,
  onRefresh,
  onNext,
}: SelectScannerStepProps) {
  const navigate = useNavigate();
  const selected = scanners.find((s) => s.id === selectedId) ?? scanners[0] ?? null;
  const selectedReady = selected?.status === "ready";
  const hasScanners = scanners.length > 0;

  return (
    <div className="scan-offline-step">
      <div className="scan-offline-step__grid">
        <section className="scan-panel">
          <h2 className="scan-panel__title">Select Scanner</h2>
          <p className="scan-panel__hint">
            {hasScanners
              ? isOnline
                ? "Choose the scanner you want to use."
                : "Choose the scanner you want to use for local scanning."
              : "Connect a scanner to this computer before you start scanning."}
          </p>

          {!hasScanners ? (
            <AppErrorState
              variant="empty"
              title="No Scanner Detected"
              message="We could not find a scanner on this computer. Connect your scanner via USB or network, then open Devices → Detect Devices and refresh the list here."
              actionLabel="Go to Devices"
              onAction={() => navigate("/devices")}
            />
          ) : (
            <>
              <div className="scan-scanner-list">
                {scanners.map((scanner) => (
                  <ScannerCard
                    key={scanner.id}
                    scanner={scanner}
                    selected={scanner.id === selectedId}
                    onSelect={() => onSelect(scanner.id)}
                  />
                ))}
              </div>

              {!selectedReady && selected ? (
                <AppErrorState
                  variant="warning"
                  title="Scanner Offline"
                  message={`${selected.name} is not ready. Check the connection and power, then refresh the scanner list.`}
                  compact
                  className="scan-scanner-offline-notice"
                />
              ) : null}

              <button
                type="button"
                className={`scan-btn scan-btn--outline scan-scanner-refresh${refreshing ? " scan-scanner-refresh--spinning" : ""}`}
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.8} />
                {refreshing ? "Refreshing…" : "Refresh Scanners"}
              </button>
            </>
          )}
        </section>

        <section className="scan-panel scan-panel--info">
          <h2 className="scan-panel__title">Scanner Information</h2>
          {selected ? (
            <>
              <div className="scan-scanner-preview" aria-hidden="true">
                <ScanLine className="h-16 w-16 text-white/30" strokeWidth={1.2} />
              </div>
              <h3 className="scan-scanner-info__name">{selected.name}</h3>
              <dl className="scan-scanner-info__list">
                <div>
                  <dt>Type</dt>
                  <dd>{selected.type}</dd>
                </div>
                <div>
                  <dt>Connection</dt>
                  <dd>{selected.connection}</dd>
                </div>
                <div>
                  <dt>Resolution Max</dt>
                  <dd>{selected.resolutionMax}</dd>
                </div>
                <div>
                  <dt>Color Depth</dt>
                  <dd>{selected.colorDepth}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className={selectedReady ? "scan-scanner-info__ready" : "scan-scanner-info__offline"}>
                    {selectedReady
                      ? isOnline
                        ? "Ready"
                        : "Ready for local scanning"
                      : "Offline — connect device to scan"}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <AppErrorState
              variant="empty"
              title="No Scanner Selected"
              message="Scanner details will appear here after you detect and add a device."
              compact
            />
          )}
        </section>
      </div>

      <div className="scan-offline-step__actions">
        <button
          type="button"
          className="scan-btn scan-btn--primary"
          onClick={onNext}
          disabled={!hasScanners || !selectedReady}
        >
          Next: Configure
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
