import { ArrowLeft, ArrowRight } from "lucide-react";

import { AppErrorState } from "../../../common/AppErrorState";
import { ScannerConnectionAlert } from "../ScannerConnectionAlert";
import {
  getBondPaperSizeDisplay,
  getFormatLabel,
  getScannerName,
  resolveDepartmentLabel,
} from "../scanOfflineHelpers";

import type { OfflineScanConfig, ScannerDevice } from "../scanOfflineData";

export type ScanPhase = "idle" | "starting" | "scanning" | "complete" | "error";

type ScanStepProps = {
  isOnline: boolean;
  config: OfflineScanConfig;
  scanners: ScannerDevice[];
  scannerId: string;
  scanning: boolean;
  scanPhase: ScanPhase;
  scanError?: string | null;
  scanComplete: boolean;
  pageCount: number;
  batchAwaitingNext: boolean;
  onBack: () => void;
  onNext: () => void;
  onStartScan: () => void;
  onNextPage: () => void;
  onStopBatch: () => void;
  onRetryScannerConnection: () => void;
  refreshingScanners?: boolean;
};

export function ScanStep({
  isOnline,
  config,
  scanners,
  scannerId,
  scanning,
  scanPhase,
  scanError,
  scanComplete,
  pageCount,
  batchAwaitingNext,
  onBack,
  onNext,
  onStartScan,
  onNextPage,
  onStopBatch,
  onRetryScannerConnection,
  refreshingScanners = false,
}: ScanStepProps) {
  const scannerName = getScannerName(scannerId, scanners);
  const selectedScanner = scanners.find((scanner) => scanner.id === scannerId) ?? scanners[0] ?? null;
  const scannerReady = selectedScanner?.status === "ready";
  const isBatch = config.scanMode === "batch";
  const isScanInProgress = scanning || scanPhase === "starting" || scanPhase === "scanning";
  const scanStatusMessage = batchAwaitingNext
    ? `Page ${pageCount} captured. Place the next page on ${scannerName}, then choose Next page or Stop.`
    : scanPhase === "starting"
      ? `Starting scan on ${scannerName}…`
      : scanPhase === "scanning"
        ? `${scannerName} is capturing your document. Do not lift the lid or remove pages yet.`
        : scanComplete
          ? isBatch && pageCount > 1
            ? `${pageCount} pages captured. Continue to Preview to review them.`
            : "Scan completed successfully."
          : isBatch
            ? "Ready for batch scan. Press Start Scan when your first page is on the scanner."
            : "Ready to scan. Press Start Scan when your document is placed on the scanner.";

  function handleGoToPreview() {
    if (batchAwaitingNext) {
      onStopBatch();
    }
    onNext();
  }

  return (
    <div className="scan-offline-step">
      <div className="scan-offline-step__grid scan-offline-step__grid--preview">
        <section className="scan-panel scan-panel--preview-full">
          <div className="scan-panel__title-row">
            <h2 className="scan-panel__title">Scan Document</h2>
          </div>

          <ScannerConnectionAlert
            scanners={scanners}
            scannerId={scannerId}
            onRetry={onRetryScannerConnection}
            refreshing={refreshingScanners}
            compact
          />

          <div className="scan-panel__scan-stage">
            {isScanInProgress ? (
              <div className="scan-panel__status scan-panel__status--scanning">
                <div className="scan-panel__spinner" aria-hidden="true" />
                <strong>{scanStatusMessage}</strong>
                <span>Real scanner in progress</span>
              </div>
            ) : scanError ? (
              <AppErrorState
                variant="error"
                title="Scan Failed"
                message={scanError}
                className="app-error-state--centered"
              />
            ) : batchAwaitingNext ? (
              <div className="scan-panel__status scan-panel__status--scanning">
                <strong>{scanStatusMessage}</strong>
                <span>{pageCount} page{pageCount === 1 ? "" : "s"} scanned so far.</span>
              </div>
            ) : scanComplete ? (
              <div className="scan-panel__status scan-panel__status--scanning">
                <strong>{scanStatusMessage}</strong>
                <span>Continue to Preview to review the captured page{pageCount === 1 ? "" : "s"}.</span>
              </div>
            ) : (
              <div className="scan-panel__status scan-panel__status--scanning">
                <strong>{scanStatusMessage}</strong>
                <span>Place your document on the scanner, then start scanning.</span>
              </div>
            )}
          </div>

          {batchAwaitingNext ? (
            <div className="scan-batch-actions">
              <button
                type="button"
                className="scan-btn scan-btn--primary scan-batch-actions__next"
                onClick={onNextPage}
              >
                Next Page
              </button>
            </div>
          ) : null}

          {!isScanInProgress && !scanComplete && !batchAwaitingNext ? (
            <div className="scan-offline-step__inline-action">
              <button
                type="button"
                className="scan-btn scan-btn--primary"
                onClick={onStartScan}
                disabled={!scannerReady}
              >
                Start Scan
              </button>
            </div>
          ) : null}
        </section>

        <section className="scan-panel scan-panel--summary">
          <h2 className="scan-panel__title">Scan Summary</h2>
          <dl className="scan-summary-list">
            <div>
              <dt>Scanner</dt>
              <dd>{scannerName}</dd>
            </div>
            <div>
              <dt>{isOnline ? "Department" : "Department / Local Category"}</dt>
              <dd>{resolveDepartmentLabel(config)}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{isBatch ? "Batch" : "Single"}</dd>
            </div>
            <div>
              <dt>{isOnline ? "Bond Paper Size" : "Paper Size"}</dt>
              <dd>{getBondPaperSizeDisplay(config.paperSizeId)}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{getFormatLabel(config)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {isScanInProgress
                  ? "Scanning…"
                  : batchAwaitingNext
                    ? "Waiting for next page"
                    : scanComplete
                      ? "Ready for preview"
                      : scanError
                        ? "Failed"
                        : "Waiting to start"}
              </dd>
            </div>
            {isBatch ? (
              <div>
                <dt>Pages Scanned</dt>
                <dd>{pageCount}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      <div className="scan-offline-step__actions scan-offline-step__actions--split">
        <button type="button" className="scan-btn scan-btn--ghost" onClick={onBack} disabled={isScanInProgress}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back
        </button>
        <button
          type="button"
          className={
            batchAwaitingNext
              ? "scan-btn scan-btn--outline-emerald"
              : "scan-btn scan-btn--primary"
          }
          onClick={handleGoToPreview}
          disabled={isScanInProgress || !!scanError || (!scanComplete && !batchAwaitingNext)}
        >
          {batchAwaitingNext ? "Stop and go to Live Preview" : "Next: Preview"}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
