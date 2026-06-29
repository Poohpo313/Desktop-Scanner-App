import { ArrowLeft, Clock, Database, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageSubtitle, getConsolePageTitle } from "../layout/consolePageMeta";
import { folderTagToDocumentsFolderId, type DocumentsLocationState } from "../documents/documentsNavigation";
import { useAppMode } from "../../context/AppModeContext";
import { useGatewayStatus } from "../../context/GatewayStatusContext";
import { useDocuments } from "../../context/DocumentsContext";
import { useSession } from "../../context/SessionContext";
import { effectiveCloudSync } from "../../lib/cloudAccess";
import {
  buildSavePreviewDescription,
  buildSavePreviewFileName,
  buildSavePreviewPaths,
  folderRuleSummary,
  isAutoSaveEnabled,
  saveMethodSummary,
  saveModeStatusLabel,
  showsAddFolderTag,
  showsFolderRuleInSummary,
  summaryTagsForSaveMode,
  syncSavePreferenceFields,
  usesManualSavePreview,
  usesMultipleLocalFolders,
} from "../../lib/savePreferencesHelpers";
import { persistSettings, resolveSettings } from "../../lib/settingsStorage";
import { readPendingSavePreview } from "../../lib/pendingSavePreview";
import { DEFAULT_SCANNED_DOCUMENTS_ROOT } from "../search/searchFolders";
import { DocumentSaveSuccessToast } from "../scan/offline/DocumentSaveSuccessToast";
import { ChooseLocalSaveFolderModal } from "../scan/offline/modals/ChooseLocalSaveFolderModal";
import { SaveModeCard, SettingsRow } from "./SettingsRow";
import {
  DEFAULT_APP_SETTINGS,
  SAVE_MODE_OPTIONS,
  type AppSettings,
  type SaveModeId,
} from "./settingsData";

import "../../styles/save-preferences-page.css";
import "../../styles/scan-offline.css";

type FolderPickerTarget = "primary" | "secondary" | null;

function SaveSummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="save-pref-summary-field">
      <span className="save-pref-summary-field__label">{label}</span>
      <span className="save-pref-summary-field__value">{value}</span>
    </div>
  );
}

export function SavePreferencesPageView() {
  const navigate = useNavigate();
  const { isOnline } = useAppMode();
  const { reachable: gatewayReachable } = useGatewayStatus();
  const { documents } = useDocuments();
  const { session } = useSession();
  const userId = session.userId;

  const [settings, setSettings] = useState<AppSettings>(() => resolveSettings(userId));
  const [savedSnapshot, setSavedSnapshot] = useState(settings);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [folderPickerTarget, setFolderPickerTarget] = useState<FolderPickerTarget>(null);

  useEffect(() => {
    const next = resolveSettings(userId);
    setSettings(next);
    setSavedSnapshot(next);
  }, [userId]);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings((current) => syncSavePreferenceFields({ ...current, ...patch }));
  }

  function handleSave() {
    const next = syncSavePreferenceFields(settings);
    if (userId != null) {
      persistSettings(userId, next);
    }
    setSettings(next);
    setSavedSnapshot(next);
    setShowSaveToast(true);
  }

  function handleReset() {
    const next = syncSavePreferenceFields({
      ...DEFAULT_APP_SETTINGS,
      storageRoot: DEFAULT_SCANNED_DOCUMENTS_ROOT,
      cloudSync: false,
    });
    setSettings(next);
    if (userId != null) {
      persistSettings(userId, next);
    }
    setSavedSnapshot(next);
  }

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSnapshot);
  const previewContext = {
    documents,
    pendingDocument: readPendingSavePreview(),
  };
  const previewFileName = buildSavePreviewFileName(settings, previewContext);
  const previewPaths = buildSavePreviewPaths(settings, previewContext);
  const previewDescription = buildSavePreviewDescription(settings, previewContext);
  const summaryTags = summaryTagsForSaveMode(settings);
  const manualSavePreview = usesManualSavePreview(settings.saveMode);
  const showAddFolder = showsAddFolderTag(settings.saveMode);
  const showFolderRule = showsFolderRuleInSummary(settings.saveMode);
  const showMultipleFolders = usesMultipleLocalFolders(settings.saveMode);
  const usesStackedSummary =
    settings.saveMode === "ask-every-time" || settings.saveMode === "local-cloud-sync";
  const usesStaticSummaryTags = usesStackedSummary;

  function openDocuments(state: DocumentsLocationState) {
    navigate("/files", { state });
  }

  function handleAddFolder() {
    openDocuments({ folderId: "all", openCreateFolder: true });
  }

  function handleFolderTag(tag: string) {
    openDocuments({ folderId: folderTagToDocumentsFolderId(tag) });
  }

  function openFolderPicker(target: FolderPickerTarget) {
    setFolderPickerTarget(target);
  }

  function handleFolderPicked(path: string) {
    if (folderPickerTarget === "primary") {
      updateSettings({
        primaryFolder: path,
        storageRoot: path,
        storageDefaultSaveLocation: path,
        defaultSaveLocation: path,
      });
    } else if (folderPickerTarget === "secondary") {
      updateSettings({ secondaryFolder: path });
    }
    setFolderPickerTarget(null);
  }

  function handleSaveModeSelect(mode: SaveModeId) {
    updateSettings({ saveMode: mode });
  }

  const folderPickerValue =
    folderPickerTarget === "secondary" ? settings.secondaryFolder : settings.primaryFolder;

  return (
    <div className="save-pref-page console-page" data-screen="section-10-save-preferences">
      <ConsolePageHeader
        title={getConsolePageTitle("Save Preferences")}
        subtitle={getConsolePageSubtitle("Save Preferences")}
        badges={
          <div className="save-pref-page__badges">
            <span
              className={`save-pref-badge${
                isAutoSaveEnabled(settings.saveMode) ? " save-pref-badge--success" : ""
              }`}
            >
              Auto-save: {isAutoSaveEnabled(settings.saveMode) ? "On" : "Off"}
            </span>
            <span className="save-pref-badge save-pref-badge--info">
              Cloud Sync:{" "}
              {effectiveCloudSync(settings.cloudSync, isOnline, gatewayReachable) ? "Optional" : "Off"}
            </span>
          </div>
        }
      />

      <div className="save-pref-page__content console-page__body">
        <Link to="/settings" className="save-pref-page__back">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Settings
        </Link>

        <div className="save-pref-page__layout">
          <div className="save-pref-page__main">
            <section className="save-pref-section">
              <h2 className="save-pref-section__title">Save Mode</h2>
              <div className="save-pref-mode-grid">
                {SAVE_MODE_OPTIONS.map((option) => (
                  <SaveModeCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    selected={settings.saveMode === option.id}
                    onSelect={() => handleSaveModeSelect(option.id)}
                  />
                ))}
              </div>
            </section>

            <section className="save-pref-card">
              <h2 className="save-pref-card__title">File Naming</h2>
              <div className="save-pref-card__body">
                <SettingsRow label="Pattern" value={settings.saveNamingPattern} />
                <SettingsRow label="Duplicate Handling" value={settings.duplicateHandling} />
                <SettingsRow label="Default Format" value={settings.defaultFileType} />
              </div>
            </section>

            <div className="save-pref-page__actions">
              <button type="button" className="save-pref-btn save-pref-btn--outline" onClick={handleReset}>
                Reset
              </button>
              <button
                type="button"
                className="save-pref-btn save-pref-btn--primary"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                Save Preferences
              </button>
            </div>
          </div>

          <aside className="save-pref-page__aside">
            <section className="save-pref-card">
              <h2 className="save-pref-card__title">Save Summary</h2>
              <div className="save-pref-card__body">
                {settings.saveMode === "auto-save" ? (
                  <SettingsRow
                    label="Default Folder"
                    value={settings.primaryFolder}
                    onClick={() => openFolderPicker("primary")}
                  />
                ) : null}

                {showMultipleFolders ? (
                  <>
                    <SettingsRow
                      label="Primary Folder"
                      value={settings.primaryFolder}
                      onClick={() => openFolderPicker("primary")}
                    />
                    <SettingsRow
                      label="Secondary Folder"
                      value={settings.secondaryFolder}
                      onClick={() => openFolderPicker("secondary")}
                    />
                  </>
                ) : null}

                {usesStackedSummary ? (
                  <div className="save-pref-summary-stack">
                    <SaveSummaryField
                      label="Save Method"
                      value={saveMethodSummary(settings.saveMode)}
                    />
                    <SaveSummaryField
                      label="Folder Rule"
                      value={folderRuleSummary(settings.saveMode, settings.departmentRule)}
                    />
                  </div>
                ) : null}

                {showFolderRule && !usesStackedSummary ? (
                  <SettingsRow
                    label="Folder Rule"
                    value={folderRuleSummary(settings.saveMode, settings.departmentRule)}
                  />
                ) : null}
              </div>

              <div className="save-pref-tags">
                {showAddFolder ? (
                  <button
                    type="button"
                    className="save-pref-tag save-pref-tag--add"
                    onClick={handleAddFolder}
                  >
                    + Add Folder
                  </button>
                ) : null}
                {summaryTags.map((tag) =>
                  usesStaticSummaryTags ? (
                    <span key={tag} className="save-pref-tag save-pref-tag--static">
                      {tag}
                    </span>
                  ) : (
                    <button
                      key={tag}
                      type="button"
                      className="save-pref-tag"
                      onClick={() => handleFolderTag(tag)}
                    >
                      {tag}
                    </button>
                  ),
                )}
              </div>
            </section>

            <section className="save-pref-preview">
              <h2 className="save-pref-preview__title">Save Preview</h2>
              {manualSavePreview ? (
                <>
                  <p className="save-pref-preview__text">{previewDescription}</p>
                  <p className="save-pref-preview__example-label">Example Output</p>
                  <ul className="save-pref-preview__paths">
                    {previewPaths.map((path) => (
                      <li key={path}>
                        <strong>{path}</strong>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="save-pref-preview__filename">{previewFileName}</p>
                  <p className="save-pref-preview__text">{previewDescription}</p>
                  <ul className="save-pref-preview__paths">
                    {previewPaths.map((path) => (
                      <li key={path}>
                        <strong>{path}</strong>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </aside>
        </div>
      </div>

      <footer className="save-pref-status-bar">
        <span className="save-pref-status-bar__item">
          <FolderOpen className="save-pref-status-bar__icon" strokeWidth={1.8} />
          Local Storage: {settings.storageRoot || settings.primaryFolder}
        </span>
        <span className="save-pref-status-bar__item">
          <Database className="save-pref-status-bar__icon" strokeWidth={1.8} />
          Database: {settings.databaseType}
        </span>
        <span className="save-pref-status-bar__item">
          <Clock className="save-pref-status-bar__icon" strokeWidth={1.8} />
          Save mode: {saveModeStatusLabel(settings.saveMode)}
        </span>
      </footer>

      {folderPickerTarget ? (
        <ChooseLocalSaveFolderModal
          value={folderPickerValue}
          onApply={handleFolderPicked}
          onClose={() => setFolderPickerTarget(null)}
          elevated
          usePortal
        />
      ) : null}

      {showSaveToast ? (
        <DocumentSaveSuccessToast
          label="SAVED"
          title="Preferences saved successfully"
          description="Your save mode, folder settings, and file naming preferences were updated."
          onClose={() => setShowSaveToast(false)}
        />
      ) : null}
    </div>
  );
}
