import { ScanText } from "lucide-react";
import { SettingsToggleRow } from "./SettingsRow";
import type { AppSettings } from "./settingsData";

type OcrTabProps = {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onOpenResetModal: () => void;
  onSave: () => void;
  canSave: boolean;
};

export function OcrTab({ settings, onChange, onOpenResetModal, onSave, canSave }: OcrTabProps) {
  return (
    <div className="settings-page__grid settings-page__grid--scan">
      <section className="settings-scan-card">
        <h2 className="settings-scan-card__title">OCR Engine Settings</h2>
        <div className="settings-scan-card__body">
          <div className="settings-scan-card__toggles settings-scan-card__toggles--standalone">
            <SettingsToggleRow
              label="OCR enabled"
              checked={settings.ocrEnabled}
              onChange={(ocrEnabled) => onChange({ ocrEnabled })}
            />
            <SettingsToggleRow
              label="Searchable PDF"
              checked={settings.ocrSearchablePdf}
              onChange={(ocrSearchablePdf) => onChange({ ocrSearchablePdf })}
            />
            <SettingsToggleRow
              label="Auto-rotate"
              checked={settings.ocrAutoRotate}
              onChange={(ocrAutoRotate) => onChange({ ocrAutoRotate })}
            />
            <SettingsToggleRow
              label="Table detection"
              checked={settings.ocrTableDetection}
              onChange={(ocrTableDetection) => onChange({ ocrTableDetection })}
            />
            <SettingsToggleRow
              label="Handwriting recognition"
              checked={settings.ocrHandwritingRecognition}
              onChange={(ocrHandwritingRecognition) => onChange({ ocrHandwritingRecognition })}
            />
          </div>
        </div>
        <div className="settings-scan-card__footer">
          <button type="button" className="settings-scan-card__reset" onClick={onOpenResetModal}>
            Reset to Defaults
          </button>
        </div>
      </section>

      <section className="settings-scan-card">
        <h2 className="settings-scan-card__title">Output &amp; Text Processing</h2>
        <div className="settings-scan-card__body">
          <div className="settings-scan-card__toggles settings-scan-card__toggles--standalone">
            <SettingsToggleRow
              label="Preserve layout"
              checked={settings.ocrPreserveLayout}
              onChange={(ocrPreserveLayout) => onChange({ ocrPreserveLayout })}
            />
            <SettingsToggleRow
              label="Keyword extraction"
              checked={settings.ocrKeywordExtraction}
              onChange={(ocrKeywordExtraction) => onChange({ ocrKeywordExtraction })}
            />
            <SettingsToggleRow
              label="PDF/A output"
              checked={settings.ocrPdfAOutput}
              onChange={(ocrPdfAOutput) => onChange({ ocrPdfAOutput })}
            />
          </div>

          <div className="settings-ocr-info">
            <span className="settings-ocr-info__icon" aria-hidden="true">
              <ScanText className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div className="settings-ocr-info__body">
              <strong className="settings-ocr-info__title">Search-ready documents</strong>
              <p className="settings-ocr-info__text">
                Scanned PDFs will be indexed for fast document search.
              </p>
            </div>
          </div>
        </div>
        <div className="settings-scan-card__footer settings-scan-card__footer--actions">
          <button
            type="button"
            className="settings-btn settings-btn--primary settings-btn--block"
            onClick={onSave}
            disabled={!canSave}
          >
            Save Changes
          </button>
        </div>
      </section>
    </div>
  );
}
