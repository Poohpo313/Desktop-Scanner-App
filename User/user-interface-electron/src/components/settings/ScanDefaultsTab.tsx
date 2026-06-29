import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDevices } from "../../context/DevicesContext";
import { discoverScanners, getInitialScannerList } from "../../lib/scanScannerDiscovery";
import { getDefaultScannerLabel } from "../../lib/settingsScanHelpers";
import { AvailableDevicesModal } from "../scan/offline/modals/AvailableDevicesModal";
import { ColorModeModal } from "../scan/offline/modals/ColorModeModal";
import { SelectionModal } from "../scan/offline/modals/SelectionModal";
import {
  getBondPaperSizeDisplay,
  getColorModeLabel,
  getResolutionLabel,
} from "../scan/offline/scanOfflineHelpers";
import {
  PAPER_SIZES,
  RESOLUTIONS,
  type ScannerDevice,
} from "../scan/offline/scanOfflineData";
import { SettingsToggleRow } from "./SettingsRow";
import type { AppSettings } from "./settingsData";
import { SETTINGS_NAMING_PATTERNS } from "./settingsData";
import "../../styles/scan-offline.css";
import "../../styles/available-devices-modal.css";

type ScanDefaultsModal = "scanner" | "paper" | "color" | "resolution" | "file-type" | "naming" | null;

const FILE_TYPE_OPTIONS = [
  { id: "PDF", label: "PDF" },
  { id: "PNG", label: "PNG" },
  { id: "JPEG", label: "JPEG" },
];

type ScanDefaultsTabProps = {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onOpenSavePreferences: () => void;
  onOpenResetModal: () => void;
  onSave: () => void;
  canSave: boolean;
};

function SettingsSelectField({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <label className="settings-scan-field">
      <span className="settings-scan-field__label">{label}</span>
      <button type="button" className="settings-scan-field__select" onClick={onClick}>
        <span>{value}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
      </button>
    </label>
  );
}

function SettingsSliderField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="settings-scan-field settings-scan-field--slider">
      <div className="settings-scan-field__slider-head">
        <span className="settings-scan-field__label">{label}</span>
        <span className="settings-scan-field__slider-value">{value}</span>
      </div>
      <input
        type="range"
        className="settings-scan-field__range"
        min={-50}
        max={50}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
    </div>
  );
}

export function ScanDefaultsTab({
  settings,
  onChange,
  onOpenSavePreferences,
  onOpenResetModal,
  onSave,
  canSave,
}: ScanDefaultsTabProps) {
  const { devices } = useDevices();
  const [modal, setModal] = useState<ScanDefaultsModal>(null);
  const [scanners, setScanners] = useState<ScannerDevice[]>(() => getInitialScannerList(devices));
  const [refreshingScanners, setRefreshingScanners] = useState(false);

  useEffect(() => {
    if (modal !== "scanner") return;
    setScanners(getInitialScannerList(devices));
  }, [devices, modal]);

  const scannerLabel = useMemo(
    () => getDefaultScannerLabel(settings.scanDefaultScannerId, scanners),
    [scanners, settings.scanDefaultScannerId],
  );
  const paperLabel = getBondPaperSizeDisplay(settings.scanPaperSizeId);
  const colorLabel = getColorModeLabel(settings.scanColorModeId);
  const resolutionLabel = getResolutionLabel(settings.scanResolutionId);

  async function handleRefreshScanners() {
    setRefreshingScanners(true);
    try {
      const next = await discoverScanners(devices);
      setScanners(next);
    } finally {
      setRefreshingScanners(false);
    }
  }

  function handleApplyScanner(scanDefaultScannerId: string) {
    onChange({ scanDefaultScannerId });
    setModal(null);
  }

  return (
    <>
      <div className="settings-page__grid settings-page__grid--scan">
        <section className="settings-scan-card">
          <h2 className="settings-scan-card__title">Default Scan Profile</h2>
          <div className="settings-scan-card__body">
            <SettingsSelectField
              label="Default scanner"
              value={scannerLabel}
              onClick={() => setModal("scanner")}
            />
            <SettingsSelectField
              label="Paper size"
              value={paperLabel}
              onClick={() => setModal("paper")}
            />
            <SettingsSelectField
              label="Color mode"
              value={colorLabel}
              onClick={() => setModal("color")}
            />
            <SettingsSelectField
              label="Resolution"
              value={resolutionLabel}
              onClick={() => setModal("resolution")}
            />

            <div className="settings-scan-card__toggles">
              <SettingsToggleRow
                label="Duplex scanning"
                checked={settings.scanDuplex}
                onChange={(scanDuplex) => onChange({ scanDuplex })}
              />
              <SettingsToggleRow
                label="Auto-crop"
                checked={settings.scanAutoCrop}
                onChange={(scanAutoCrop) => onChange({ scanAutoCrop })}
              />
              <SettingsToggleRow
                label="Blank page removal"
                checked={settings.scanBlankPageRemoval}
                onChange={(scanBlankPageRemoval) => onChange({ scanBlankPageRemoval })}
              />
              <SettingsToggleRow
                label="Auto deskew"
                checked={settings.scanAutoDeskew}
                onChange={(scanAutoDeskew) => onChange({ scanAutoDeskew })}
              />
            </div>

            <SettingsSliderField
              label="Brightness"
              value={settings.scanBrightness}
              onChange={(scanBrightness) => onChange({ scanBrightness })}
            />
            <SettingsSliderField
              label="Contrast"
              value={settings.scanContrast}
              onChange={(scanContrast) => onChange({ scanContrast })}
            />
          </div>
          <div className="settings-scan-card__footer">
            <button type="button" className="settings-scan-card__reset" onClick={onOpenResetModal}>
              Reset to Defaults
            </button>
          </div>
        </section>

        <section className="settings-scan-card">
          <h2 className="settings-scan-card__title">Output &amp; Processing</h2>
          <div className="settings-scan-card__body">
            <SettingsSelectField
              label="File type"
              value={settings.defaultFileType}
              onClick={() => setModal("file-type")}
            />
            <SettingsSelectField
              label="Naming pattern"
              value={settings.saveNamingPattern}
              onClick={() => setModal("naming")}
            />
            <SettingsToggleRow
              label="OCR after scan"
              checked={settings.ocrAutoOnScan}
              onChange={(ocrAutoOnScan) => onChange({ ocrAutoOnScan })}
            />
            <SettingsToggleRow
              label="Open file after save"
              checked={settings.autoOpenAfterScan}
              onChange={(autoOpenAfterScan) => onChange({ autoOpenAfterScan })}
            />
            <label className="settings-scan-field">
              <span className="settings-scan-field__label">Destination folder</span>
              <button
                type="button"
                className="settings-scan-field__path"
                onClick={onOpenSavePreferences}
              >
                {settings.primaryFolder}
              </button>
            </label>
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

      {modal === "scanner" ? (
        <AvailableDevicesModal
          scanners={scanners}
          value={settings.scanDefaultScannerId}
          refreshing={refreshingScanners}
          onRefresh={() => void handleRefreshScanners()}
          onApply={handleApplyScanner}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "paper" ? (
        <SelectionModal
          title="Bond Paper Size"
          options={PAPER_SIZES.map((paper) => ({
            id: paper.id,
            label: paper.label,
            description: paper.description?.split(" — ")[0],
          }))}
          value={settings.scanPaperSizeId}
          summaryLabel="Selected size"
          onApply={(scanPaperSizeId) => onChange({ scanPaperSizeId })}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "color" ? (
        <ColorModeModal
          value={settings.scanColorModeId}
          onApply={(scanColorModeId) => onChange({ scanColorModeId })}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "resolution" ? (
        <SelectionModal
          title="Resolution"
          options={RESOLUTIONS}
          value={settings.scanResolutionId}
          onApply={(scanResolutionId) => onChange({ scanResolutionId })}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "file-type" ? (
        <SelectionModal
          title="File Type"
          options={FILE_TYPE_OPTIONS}
          value={settings.defaultFileType}
          onApply={(value) => {
            onChange({
              defaultFileType: value,
              scanFileFormat: value,
              ocrSearchablePdf: value === "PDF",
            });
          }}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "naming" ? (
        <SelectionModal
          title="File Naming Pattern"
          options={SETTINGS_NAMING_PATTERNS.map((pattern) => ({
            id: pattern.id,
            label: pattern.label,
            description: pattern.description,
          }))}
          value={settings.saveNamingPattern}
          onApply={(saveNamingPattern) => onChange({ saveNamingPattern })}
          onClose={() => setModal(null)}
        />
      ) : null}
    </>
  );
}
