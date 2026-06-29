import { ChevronDown, Info } from "lucide-react";

import { OfflineScanSampleNotice } from "../OfflineScanSampleNotice";
import { ScannerConnectionAlert } from "../ScannerConnectionAlert";

import {
  COLOR_MODES,
  RESOLUTIONS,
  SCAN_PRESETS,
  type OfflineScanConfig,
  type ScannerDevice,
} from "../scanOfflineData";
import {
  getBondPaperSizeDisplay,
  resolveDepartmentLabel,
} from "../scanOfflineHelpers";

type ConfigureStepProps = {
  isOnline: boolean;
  config: OfflineScanConfig;
  scanners: ScannerDevice[];
  scannerId: string;
  activePreset: string | null;
  onChange: (patch: Partial<OfflineScanConfig>) => void;
  onBack: () => void;
  onNext: () => void;
  onOpenScanner: () => void;
  onOpenFolder: () => void;
  onOpenPaperSize: () => void;
  onOpenColorMode: () => void;
  onOpenResolution: () => void;
  onOpenNamingPattern: () => void;
  onApplyPreset: (preset: string) => void;
  onRetryScannerConnection: () => void;
  refreshingScanners?: boolean;
};



function ToggleGroup<T extends string>({

  value,

  options,

  onChange,

}: {

  value: T;

  options: { id: T; label: string }[];

  onChange: (v: T) => void;

}) {

  return (

    <div className="scan-toggle-group">

      {options.map((opt) => (

        <button

          key={opt.id}

          type="button"

          className={`scan-toggle-group__btn${value === opt.id ? " scan-toggle-group__btn--active" : ""}`}

          onClick={() => onChange(opt.id)}

        >

          {opt.label}

        </button>

      ))}

    </div>

  );

}



function FieldButton({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {

  return (

    <label className="scan-field">

      <span className="scan-field__label">{label}</span>

      <button type="button" className="scan-field__select" onClick={onClick}>

        <span>{value}</span>

        <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />

      </button>

    </label>

  );

}



export function ConfigureStep({
  isOnline,
  config,
  scanners,
  scannerId,
  activePreset,
  onChange,
  onBack,
  onNext,
  onOpenScanner,
  onOpenFolder,
  onOpenPaperSize,
  onOpenColorMode,
  onOpenResolution,
  onOpenNamingPattern,
  onApplyPreset,
  onRetryScannerConnection,
  refreshingScanners = false,
}: ConfigureStepProps) {

  const scanner = scanners.find((s) => s.id === scannerId) ?? scanners[0];

  const department = resolveDepartmentLabel(config);

  const paperSize = getBondPaperSizeDisplay(config.paperSizeId);

  const colorMode = COLOR_MODES.find((c) => c.id === config.colorModeId)?.label ?? "Color";

  const resolution = RESOLUTIONS.find((r) => r.id === config.resolutionId)?.label ?? "300 DPI";



  return (

    <div className="scan-offline-step scan-offline-step--configure">

      <div className="scan-offline-step__body scan-offline-step__body--configure">
        <div className="scan-offline-step__grid scan-offline-step__grid--configure">
          <section className="scan-panel scan-panel--configure-scroll">
            <div className="scan-panel__scroll">
              {!isOnline ? (
                <OfflineScanSampleNotice>
                  Configure scan settings below. Choose a save folder with Browse — files are written to your
                  device when you save.
                </OfflineScanSampleNotice>
              ) : null}

              <ScannerConnectionAlert
                scanners={scanners}
                scannerId={scannerId}
                onRetry={onRetryScannerConnection}
                refreshing={refreshingScanners}
                compact
              />

              <FieldButton
                label="Scanner Device"
                value={scanner?.name ?? "No scanner selected"}
                onClick={onOpenScanner}
              />

              <label className="scan-field">
                <span className="scan-field__label">
                  {isOnline ? "Department" : "Department / Local Category"}
                </span>
                <input
                  type="text"
                  className="scan-field__input scan-field__input--readonly"
                  value={department}
                  readOnly
                  aria-readonly="true"
                />
                <p className="scan-field__note">
                  Assigned to your account and cannot be changed during scanning.
                </p>
              </label>

              <div className="scan-field">
                <span className="scan-field__label">Paper Routing / Folder Route</span>
                <div className="scan-field__path-row">
                  <input
                    type="text"
                    className="scan-field__input"
                    value={config.savePath}
                    readOnly
                  />
                  <button type="button" className="scan-btn scan-btn--outline" onClick={onOpenFolder}>
                    Browse
                  </button>
                </div>
                <p className="scan-field__note">
                  {isOnline
                    ? "This replaces Document Type. Scanned files will be saved directly to this assigned folder."
                    : "Files will be saved locally to the selected folder."}
                </p>
              </div>

              <div className="scan-field">
                <span className="scan-field__label">Scan Source</span>
                <ToggleGroup
                  value={config.scanSource}
                  options={[
                    { id: "flatbed", label: "Flatbed" },
                    { id: "adf", label: "ADF" },
                  ]}
                  onChange={(v) => onChange({ scanSource: v })}
                />
              </div>

              <FieldButton
                label={isOnline ? "Bond Paper Size" : "Paper Size"}
                value={paperSize}
                onClick={onOpenPaperSize}
              />

              <FieldButton label="Color Mode" value={colorMode} onClick={onOpenColorMode} />

              <FieldButton label="Resolution" value={resolution} onClick={onOpenResolution} />

              <div className="scan-field">
                <span className="scan-field__label">Duplex Scanning</span>
                <ToggleGroup
                  value={config.duplex}
                  options={[
                    { id: "single", label: "Single-sided" },
                    { id: "double", label: "Double-sided" },
                  ]}
                  onChange={(v) => onChange({ duplex: v })}
                />
              </div>

              <div className="scan-field">
                <span className="scan-field__label">File Format</span>
                <ToggleGroup
                  value={config.fileFormat}
                  options={[
                    { id: "pdf", label: "PDF" },
                    { id: "png", label: "PNG" },
                    { id: "jpeg", label: "JPEG" },
                  ]}
                  onChange={(v) =>
                    onChange({
                      fileFormat: v,
                      ocrEnabled: v === "pdf" ? true : config.ocrEnabled,
                    })
                  }
                />
                <p className="scan-field__note">
                  PDF saves searchable text by default. Choose PNG or JPEG only when you need an image file.
                </p>
              </div>

              <div className="scan-field">
                <span className="scan-field__label">{isOnline ? "OCR" : "OCR Text Recognition"}</span>
                <ToggleGroup
                  value={config.ocrEnabled ? "on" : "off"}
                  options={[
                    { id: "on", label: "Enabled" },
                    { id: "off", label: "Off" },
                  ]}
                  onChange={(v) => onChange({ ocrEnabled: v === "on" })}
                />
                <p className="scan-field__note">
                  Extracts document text for search. Recommended for PDF scans.
                </p>
              </div>

              <div className="scan-field">
                <span className="scan-field__label">File Naming Pattern</span>
                <button type="button" className="scan-field__select" onClick={onOpenNamingPattern}>
                  <span>{config.namingPattern}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
                </button>
                <p className="scan-field__example">
                  {isOnline ? "{Department}_{Date}_{Time}" : "Finance_2024-05-20_14-30"}
                </p>
              </div>

              {!isOnline ? (
                <div className="scan-info-banner scan-info-banner--offline">
                  <Info className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>
                    You&apos;re in Offline Mode. Cloud sync, remote backup, and shared folders are
                    unavailable. Scan configuration and local save are fully available.
                  </span>
                </div>
              ) : null}

              <h3 className="scan-presets__title">{isOnline ? "Quick Presets" : "Quick Presets (Local)"}</h3>
              <div className="scan-presets">
                {Object.keys(SCAN_PRESETS).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`scan-presets__btn${activePreset === preset ? " scan-presets__btn--active" : ""}`}
                    onClick={() => onApplyPreset(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="scan-panel scan-panel--scan-mode" aria-label="Scan mode">
            <p className="scan-panel--scan-mode__eyebrow">Choose how to scan</p>
            <h2 className="scan-panel--scan-mode__title">Scan Mode</h2>
            <p className="scan-panel--scan-mode__desc">
              Single captures one page. Batch lets you scan multiple pages before live preview.
            </p>
            <ToggleGroup
              value={config.scanMode}
              options={[
                { id: "single", label: "Single" },
                { id: "batch", label: "Batch" },
              ]}
              onChange={(v) => onChange({ scanMode: v })}
            />
            <div className="scan-panel--scan-mode__hint">
              {config.scanMode === "batch"
                ? "After each page you can scan the next page or stop and review all pages together."
                : "Best for one document or a single page at a time."}
            </div>
          </aside>
        </div>
      </div>

      <div className="scan-offline-step__actions scan-offline-step__actions--split scan-offline-step__actions--configure">

        <button type="button" className="scan-btn scan-btn--ghost" onClick={onBack}>

          Back

        </button>

        <button type="button" className="scan-btn scan-btn--primary" onClick={onNext}>

          Next: Scan

        </button>

      </div>

    </div>

  );

}

