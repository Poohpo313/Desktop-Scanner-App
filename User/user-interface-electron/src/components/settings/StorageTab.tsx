import { ChevronDown, FolderOpen } from "lucide-react";
import { useState } from "react";
import { ChooseLocalSaveFolderModal } from "../scan/offline/modals/ChooseLocalSaveFolderModal";
import { SelectionModal } from "../scan/offline/modals/SelectionModal";
import { SettingsToggleRow } from "./SettingsRow";
import { defaultSaveLocationPatch, getDefaultSaveLocationDisplay } from "../../lib/documentStorageConfig";
import {
  STORAGE_FOLDER_ORGANIZATION_MODAL_OPTIONS,
  storageOptionLabel,
} from "./storageSettingsData";
import type { AppSettings } from "./settingsData";

type StorageTabModal = "folder-organization" | null;

type FolderPickerTarget = "default-save" | "temp-folder" | "external-backup" | null;

type StorageTabProps = {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
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

function SettingsPathField({
  label,
  value,
  onBrowse,
}: {
  label: string;
  value: string;
  onBrowse: () => void;
}) {
  return (
    <label className="settings-scan-field">
      <span className="settings-scan-field__label">{label}</span>
      <div className="settings-storage-path">
        <input
          type="text"
          className="settings-storage-path__input"
          value={value}
          readOnly
          aria-label={label}
        />
        <button
          type="button"
          className="settings-storage-path__browse"
          onClick={onBrowse}
          aria-label={`Browse ${label}`}
        >
          <FolderOpen className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </label>
  );
}

function StorageUsageMeter({
  label,
  usedGb,
  totalGb,
}: {
  label: string;
  usedGb: number;
  totalGb: number;
}) {
  const percent = Math.min(100, Math.round((usedGb / totalGb) * 100));

  return (
    <div className="settings-storage-usage">
      <div className="settings-storage-usage__head">
        <span className="settings-storage-usage__label">{label}</span>
        <span className="settings-storage-usage__value">
          {usedGb.toFixed(1)} GB of {totalGb} GB
        </span>
      </div>
      <div
        className="settings-storage-usage__track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span className="settings-storage-usage__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function StorageTab({
  settings,
  onChange,
}: StorageTabProps) {
  const [modal, setModal] = useState<StorageTabModal>(null);
  const [folderPicker, setFolderPicker] = useState<FolderPickerTarget>(null);

  const folderPickerValue =
    folderPicker === "temp-folder"
      ? settings.storageTempFolder
      : folderPicker === "external-backup"
        ? settings.storageExternalBackup
        : getDefaultSaveLocationDisplay(settings);

  function handleFolderPicked(path: string) {
    if (folderPicker === "default-save") {
      onChange(defaultSaveLocationPatch(path));
    } else if (folderPicker === "temp-folder") {
      onChange({ storageTempFolder: path });
    } else if (folderPicker === "external-backup") {
      onChange({
        storageExternalBackup: path,
        storageExternalBackupModeId: "local-drive",
        storageExternalBackupMode: "Local drive backup",
      });
    }
    setFolderPicker(null);
  }

  return (
    <>
      <div className="settings-page__grid settings-page__grid--scan">
        <section className="settings-scan-card">
          <h2 className="settings-scan-card__title">Local Storage</h2>
          <div className="settings-scan-card__body">
            <SettingsPathField
              label="Default save location"
              value={getDefaultSaveLocationDisplay(settings)}
              onBrowse={() => setFolderPicker("default-save")}
            />
            <SettingsPathField
              label="Temporary files folder"
              value={settings.storageTempFolder}
              onBrowse={() => setFolderPicker("temp-folder")}
            />
            <SettingsSelectField
              label="Folder organization"
              value={settings.storageFolderOrganization}
              onClick={() => setModal("folder-organization")}
            />

            <div className="settings-scan-card__toggles settings-scan-card__toggles--standalone">
              <SettingsToggleRow
                label="Auto-create subfolders"
                checked={settings.storageAutoCreateSubfolders}
                onChange={(storageAutoCreateSubfolders) => onChange({ storageAutoCreateSubfolders })}
              />
              <SettingsToggleRow
                label="Auto-clean temp files"
                checked={settings.storageAutoCleanTemp}
                onChange={(storageAutoCleanTemp) => onChange({ storageAutoCleanTemp })}
              />
              <SettingsToggleRow
                label="Archive completed scans"
                checked={settings.storageArchiveCompleted}
                onChange={(storageArchiveCompleted) => onChange({ storageArchiveCompleted })}
              />
            </div>
          </div>
        </section>

        <section className="settings-scan-card">
          <h2 className="settings-scan-card__title">Storage Usage &amp; Sync</h2>
          <div className="settings-scan-card__body">
            <StorageUsageMeter
              label="Local storage used"
              usedGb={settings.storageLocalUsedGb}
              totalGb={settings.storageLocalTotalGb}
            />
            <StorageUsageMeter
              label="Cloud storage used"
              usedGb={settings.storageCloudUsedGb}
              totalGb={settings.storageCloudTotalGb}
            />

            <div className="settings-scan-card__toggles settings-scan-card__toggles--standalone">
              <SettingsToggleRow
                label="Sync on startup"
                checked={settings.storageSyncOnStartup}
                onChange={(storageSyncOnStartup) => onChange({ storageSyncOnStartup })}
              />
            </div>

            <SettingsPathField
              label="External backup"
              value={settings.storageExternalBackup}
              onBrowse={() => setFolderPicker("external-backup")}
            />

            <div className="settings-scan-card__toggles settings-scan-card__toggles--standalone">
              <SettingsToggleRow
                label="Low-space alerts"
                checked={settings.storageLowSpaceAlerts}
                onChange={(storageLowSpaceAlerts) => onChange({ storageLowSpaceAlerts })}
              />
            </div>
          </div>
        </section>
      </div>

      {modal === "folder-organization" ? (
        <SelectionModal
          title="Folder Organization"
          subtitle="Choose how scanned files are grouped inside your save folders."
          options={STORAGE_FOLDER_ORGANIZATION_MODAL_OPTIONS}
          value={settings.storageFolderOrganizationId}
          showSummary={false}
          onApply={(storageFolderOrganizationId) =>
            onChange({
              storageFolderOrganizationId,
              storageFolderOrganization: storageOptionLabel(
                STORAGE_FOLDER_ORGANIZATION_MODAL_OPTIONS,
                storageFolderOrganizationId,
                settings.storageFolderOrganization,
              ),
            })
          }
          onClose={() => setModal(null)}
        />
      ) : null}

      {folderPicker ? (
        <ChooseLocalSaveFolderModal
          value={folderPickerValue}
          onApply={handleFolderPicked}
          onClose={() => setFolderPicker(null)}
          elevated
          usePortal
        />
      ) : null}
    </>
  );
}
