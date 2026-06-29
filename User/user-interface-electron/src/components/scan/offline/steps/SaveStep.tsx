import { ArrowLeft, ChevronDown, Loader2, Printer } from "lucide-react";
import { ScanDocumentPreview } from "../ScanDocumentPreview";
import { ScanPreviewViewport } from "../ScanPreviewViewport";
import { ScannerConnectionAlert } from "../ScannerConnectionAlert";
import {
  getColorModeLabel,
  resolveDepartmentLabel,
  getFormatLabel,
  getFormatSaveLabel,
  getResolutionLabel,
} from "../scanOfflineHelpers";
import type { OfflineScanConfig, ScannerDevice } from "../scanOfflineData";

export type SaveFormState = {
  fileName: string;
  notes: string;
  saveLocallyOnly: boolean;
  cloudSync: boolean;
  addToRecords: boolean;
};

type SaveStepProps = {
  config: OfflineScanConfig;
  scanners: ScannerDevice[];
  scannerId: string;
  saveForm: SaveFormState;
  isOnline: boolean;
  scanPreviewUrl?: string | null;
  scanning?: boolean;
  saving?: boolean;
  canSave?: boolean;
  onChange: (patch: Partial<SaveFormState>) => void;
  onBack: () => void;
  onSave: () => void;
  onRescan: () => void;
  onBrowse: () => void;
  onOpenFileFormat: () => void;
  onCloudSyncInfo: () => void;
  onSaveAndPrint: () => void;
  saveDestinationPreview?: string;
  onRetryScannerConnection: () => void;
  refreshingScanners?: boolean;
};

const NOTES_MAX = 500;

export function SaveStep({
  config,
  scanners,
  scannerId,
  saveForm,
  onChange,
  onBack,
  onSave,
  onRescan,
  onBrowse,
  onOpenFileFormat,
  onCloudSyncInfo,
  onSaveAndPrint,
  saveDestinationPreview,
  isOnline,
  scanPreviewUrl,
  scanning = false,
  saving = false,
  canSave = true,
  onRetryScannerConnection,
  refreshingScanners = false,
}: SaveStepProps) {
  const notesLength = saveForm.notes.length;
  const hasFileName = saveForm.fileName.trim().length > 0;
  const saveDisabled = saving || scanning || !canSave || !hasFileName;

  if (isOnline) {
    return (
      <div className="scan-offline-step">
        <div className="scan-offline-step__grid scan-offline-step__grid--save scan-offline-step__grid--save-online">
          <section className="scan-panel">
            <ScannerConnectionAlert
              scanners={scanners}
              scannerId={scannerId}
              onRetry={onRetryScannerConnection}
              refreshing={refreshingScanners}
              compact
            />
            <label className="scan-field">
              <span className="scan-field__label">File Name</span>
              <input
                type="text"
                className="scan-field__input scan-field__input--text"
                value={saveForm.fileName}
                placeholder="Enter a file name"
                onChange={(e) => onChange({ fileName: e.target.value })}
              />
            </label>

            <label className="scan-field">
              <span className="scan-field__label">File Format</span>
              <button type="button" className="scan-field__select" onClick={onOpenFileFormat}>
                <span>{getFormatSaveLabel(config)}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
              </button>
            </label>

            <div className="scan-save-options">
              <label
                className={`scan-save-option${saveForm.cloudSync ? " scan-save-option--checked" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={saveForm.cloudSync}
                  onChange={(e) => onChange({ cloudSync: e.target.checked })}
                />
                <span className="scan-save-option__body">
                  <strong>Save locally and sync to cloud</strong>
                  <span>
                    The document will be saved on this computer and uploaded when cloud sync is
                    available.
                  </span>
                </span>
              </label>

              <label
                className={`scan-save-option${saveForm.addToRecords ? " scan-save-option--checked" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={saveForm.addToRecords}
                  onChange={(e) => onChange({ addToRecords: e.target.checked })}
                />
                <span className="scan-save-option__body">
                  <strong>Add to document records</strong>
                  <span>
                    The document will be indexed for searching and department-based access.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="scan-panel scan-panel--final-summary">
            <h2 className="scan-panel__title">Live Scan Preview</h2>
            <ScanPreviewViewport>
              {scanning ? (
                <div className="scan-panel__status scan-panel__status--scanning">
                  <Loader2 className="scan-panel__spinner" strokeWidth={2} />
                  <span>Scanning document…</span>
                </div>
              ) : (
                <ScanDocumentPreview
                  variant="thumbnail"
                  config={config}
                  scanImageUrl={scanPreviewUrl}
                  caption="LIVE SCAN PREVIEW - PAGE 1"
                />
              )}
            </ScanPreviewViewport>

            <dl className="scan-summary-list scan-summary-list--compact">
              <div>
                <dt>Pages</dt>
                <dd>1</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{resolveDepartmentLabel(config)}</dd>
              </div>
              <div>
                <dt>OCR</dt>
                <dd>{config.ocrEnabled ? "Enabled" : "Off"}</dd>
              </div>
              <div>
                <dt>Cloud Sync</dt>
                <dd>{saveForm.cloudSync ? "On" : "Off"}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="scan-offline-step__actions scan-offline-step__actions--split scan-offline-step__actions--save">
          <button type="button" className="scan-btn scan-btn--ghost" onClick={onBack} disabled={saving}>
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Back
          </button>
          <div className="scan-offline-step__actions-group">
            <button
              type="button"
              className="scan-btn scan-btn--danger"
              onClick={onRescan}
              disabled={saving || scanning}
            >
              Rescan
            </button>
            <button
              type="button"
              className="scan-btn scan-btn--primary"
              onClick={onSave}
              disabled={saveDisabled}
            >
              {saving ? "Saving…" : "Save Document"}
            </button>
            <button
              type="button"
              className="scan-btn scan-btn--outline-emerald"
              onClick={onSaveAndPrint}
              disabled={saveDisabled}
            >
              <Printer className="h-4 w-4" strokeWidth={2} />
              Save &amp; Print
              <ChevronDown className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-offline-step">
      <div className="scan-offline-step__grid scan-offline-step__grid--save">
        <section className="scan-panel">
          <h2 className="scan-panel__title">Save Document</h2>

          <ScannerConnectionAlert
            scanners={scanners}
            scannerId={scannerId}
            onRetry={onRetryScannerConnection}
            refreshing={refreshingScanners}
            compact
          />

          <label className="scan-field">
            <span className="scan-field__label">File Name</span>
            <input
              type="text"
              className="scan-field__input scan-field__input--text"
              value={saveForm.fileName}
              placeholder="Enter a file name"
              onChange={(e) => onChange({ fileName: e.target.value })}
            />
          </label>

          <div className="scan-field">
            <span className="scan-field__label">Save Location</span>
            <div className="scan-field__path-row">
              <input
                type="text"
                className="scan-field__input scan-field__input--text scan-field__input--readonly"
                value={saveDestinationPreview || config.savePath}
                readOnly
              />
              <button type="button" className="scan-btn scan-btn--outline" onClick={onBrowse}>
                Browse
              </button>
            </div>
            {saveDestinationPreview ? (
              <p className="scan-field__note">This file will be saved to the location above.</p>
            ) : null}
          </div>

          <label className="scan-field">
            <span className="scan-field__label">File Format</span>
            <button type="button" className="scan-field__select" onClick={onOpenFileFormat}>
              <span>{getFormatSaveLabel(config)}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
            </button>
            <p className="scan-field__note">Searchable PDF with OCR text layer.</p>
          </label>

          <label className="scan-field">
            <span className="scan-field__label">Notes</span>
            <textarea
              className="scan-field__textarea"
              placeholder="Add optional notes about this document…"
              value={saveForm.notes}
              maxLength={NOTES_MAX}
              onChange={(e) => onChange({ notes: e.target.value })}
            />
            <p className="scan-field__counter">
              {notesLength} / {NOTES_MAX} characters
            </p>
          </label>

          <div className="scan-save-options scan-save-options--panel">
            <h3 className="scan-save-options__title">Save Options</h3>

            <label className="scan-save-option scan-save-option--checked">
              <input
                type="checkbox"
                checked={saveForm.saveLocallyOnly}
                onChange={(e) => onChange({ saveLocallyOnly: e.target.checked })}
              />
              <span className="scan-save-option__body">
                <strong>Save locally only</strong>
                <span>The document will be stored on this computer.</span>
              </span>
            </label>

            <label
              className="scan-save-option scan-save-option--disabled"
              onClick={(event) => {
                event.preventDefault();
                onCloudSyncInfo();
              }}
            >
              <input type="checkbox" disabled />
              <span className="scan-save-option__body">
                <strong>Add to department records Cloud Sync</strong>
                <span>
                  Cloud sync is disabled while offline. This document will sync when you&apos;re
                  back online.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="scan-panel scan-panel--final-summary">
          <h2 className="scan-panel__title">Final Summary</h2>

          {scanning ? (
            <div className="scan-panel__status scan-panel__status--scanning">
              <Loader2 className="scan-panel__spinner" strokeWidth={2} />
              <span>Scanning document…</span>
            </div>
          ) : (
            <ScanDocumentPreview variant="thumbnail" config={config} scanImageUrl={scanPreviewUrl} />
          )}

          <dl className="scan-summary-list scan-summary-list--compact">
            <div>
              <dt>Pages</dt>
              <dd>1</dd>
            </div>
            <div>
              <dt>Color Mode</dt>
              <dd>{getColorModeLabel(config.colorModeId)}</dd>
            </div>
            <div>
              <dt>Resolution</dt>
              <dd>{getResolutionLabel(config.resolutionId)}</dd>
            </div>
            <div>
              <dt>File Format</dt>
              <dd>{getFormatLabel(config)}</dd>
            </div>
            <div>
              <dt>Estimated File Size</dt>
              <dd>~ 1.2 MB</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="scan-offline-step__actions scan-offline-step__actions--split scan-offline-step__actions--save">
        <button type="button" className="scan-btn scan-btn--ghost" onClick={onBack} disabled={saving}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back
        </button>
        <div className="scan-offline-step__actions-group">
          <button
            type="button"
            className="scan-btn scan-btn--danger"
            onClick={onRescan}
            disabled={saving || scanning}
          >
            Rescan
          </button>
          <button
            type="button"
            className="scan-btn scan-btn--primary"
            onClick={onSave}
            disabled={saveDisabled}
          >
            {saving ? "Saving…" : "Save Document"}
          </button>
          <button
            type="button"
            className="scan-btn scan-btn--outline-emerald"
            onClick={onSaveAndPrint}
            disabled={saveDisabled}
          >
            <Printer className="h-4 w-4" strokeWidth={2} />
            Save &amp; Print
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
