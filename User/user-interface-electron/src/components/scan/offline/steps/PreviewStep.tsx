import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Minus, Plus, Trash2 } from "lucide-react";

import type { CSSProperties } from "react";

import { AppErrorState } from "../../../common/AppErrorState";
import { ScannerConnectionAlert } from "../ScannerConnectionAlert";
import { ScanDocumentPreview } from "../ScanDocumentPreview";
import { ScanPreviewViewport } from "../ScanPreviewViewport";

import {
  getBondPaperSizeDisplay,
  resolveDepartmentLabel,
  getFormatLabel,
  getScannerName,
} from "../scanOfflineHelpers";

import type { OfflineScanConfig, ScannerDevice } from "../scanOfflineData";

type PreviewStepProps = {
  isOnline: boolean;
  config: OfflineScanConfig;
  scanners: ScannerDevice[];
  scannerId: string;
  zoomLabel: string;
  previewStyle: CSSProperties;
  stageStyle: CSSProperties;
  scanImageUrl?: string | null;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onBack: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToPage: () => void;
  onRetryScannerConnection: () => void;
  refreshingScanners?: boolean;
  allowDeletePage?: boolean;
  onDeletePage?: () => void;
};

export function PreviewStep({
  isOnline,
  config,
  scanners,
  scannerId,
  zoomLabel,
  previewStyle,
  stageStyle,
  scanImageUrl,
  pageCount,
  currentPage,
  onPageChange,
  onBack,
  onNext,
  onZoomIn,
  onZoomOut,
  onFitToPage,
  onRetryScannerConnection,
  refreshingScanners = false,
  allowDeletePage = false,
  onDeletePage,
}: PreviewStepProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < pageCount;

  return (
    <div className="scan-offline-step">
      <div className="scan-offline-step__grid scan-offline-step__grid--preview">
        <section className="scan-panel scan-panel--preview-full">
          <div className="scan-panel__title-row">
            <h2 className="scan-panel__title">Live Preview</h2>
            {isOnline ? (
              <button type="button" className="scan-panel__link-btn" onClick={onFitToPage}>
                Fit to Page
              </button>
            ) : null}
          </div>

          <ScannerConnectionAlert
            scanners={scanners}
            scannerId={scannerId}
            onRetry={onRetryScannerConnection}
            refreshing={refreshingScanners}
            compact
          />

          <ScanPreviewViewport stageStyle={stageStyle}>
            {scanImageUrl ? (
              <ScanDocumentPreview
                previewStyle={previewStyle}
                config={config}
                scanImageUrl={scanImageUrl}
              />
            ) : (
              <AppErrorState
                variant="error"
                title="No Preview Available"
                message="The scanned image could not be loaded. Go back to Scan and try again."
                className="app-error-state--centered"
              />
            )}
          </ScanPreviewViewport>

          <div
            className={`scan-preview-controls scan-preview-controls--full${
              isOnline ? " scan-preview-controls--online" : ""
            }`}
          >
            {pageCount > 1 ? (
              <>
                <button
                  type="button"
                  className="scan-preview-controls__btn"
                  aria-label="Previous page"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={!canGoPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="scan-preview-controls__pages">
                  {currentPage} / {pageCount}
                </span>
                <button
                  type="button"
                  className="scan-preview-controls__btn"
                  aria-label="Next page"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!canGoNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}

            {isOnline ? (
              <>
                <button
                  type="button"
                  className="scan-preview-controls__text-btn"
                  onClick={onZoomOut}
                >
                  − Zoom Out
                </button>
                <span className="scan-preview-controls__zoom">{zoomLabel}</span>
                <button
                  type="button"
                  className="scan-preview-controls__text-btn"
                  onClick={onZoomIn}
                >
                  + Zoom In
                </button>
                <button
                  type="button"
                  className="scan-preview-controls__text-btn"
                  onClick={onFitToPage}
                >
                  Fit to Page
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="scan-preview-controls__btn"
                  aria-label="Zoom out"
                  onClick={onZoomOut}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span>{zoomLabel}</span>
                <button
                  type="button"
                  className="scan-preview-controls__btn"
                  aria-label="Zoom in"
                  onClick={onZoomIn}
                >
                  <Plus className="h-4 w-4" />
                </button>
                {pageCount <= 1 ? <span className="scan-preview-controls__pages">1 / 1</span> : null}
              </>
            )}
          </div>
        </section>

        <section className="scan-panel scan-panel--summary">
          <h2 className="scan-panel__title">Scan Summary</h2>
          <dl className="scan-summary-list">
            <div>
              <dt>Scanner</dt>
              <dd>{getScannerName(scannerId, scanners)}</dd>
            </div>
            <div>
              <dt>{isOnline ? "Department" : "Department / Local Category"}</dt>
              <dd>{resolveDepartmentLabel(config)}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{config.scanMode === "batch" ? "Batch" : "Single"}</dd>
            </div>
            <div>
              <dt>{isOnline ? "Bond Paper Size" : "Paper Size"}</dt>
              <dd>{getBondPaperSizeDisplay(config.paperSizeId)}</dd>
            </div>
            {!isOnline ? (
              <>
                <div>
                  <dt>Format</dt>
                  <dd>{getFormatLabel(config)}</dd>
                </div>
                <div>
                  <dt>Pages Scanned</dt>
                  <dd>
                    {pageCount} page{pageCount === 1 ? "" : "s"}
                  </dd>
                </div>
              </>
            ) : (
              <div>
                <dt>Pages Scanned</dt>
                <dd>
                  {pageCount} page{pageCount === 1 ? "" : "s"}
                </dd>
              </div>
            )}
          </dl>
          {allowDeletePage && onDeletePage ? (
            <div className="scan-preview-delete">
              <button
                type="button"
                className="scan-btn scan-btn--outline scan-preview-delete__btn"
                onClick={onDeletePage}
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                Delete This Page
              </button>
              <p className="scan-preview-delete__hint">
                Remove this scan and return to Scan to capture a replacement.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <div className="scan-offline-step__actions scan-offline-step__actions--split">
        <button type="button" className="scan-btn scan-btn--ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back
        </button>
        <button
          type="button"
          className="scan-btn scan-btn--primary"
          onClick={onNext}
          disabled={!scanImageUrl}
        >
          Next: Save
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
