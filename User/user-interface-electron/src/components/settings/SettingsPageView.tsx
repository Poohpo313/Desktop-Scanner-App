import { Clock, Database, FolderOpen } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppMode } from "../../context/AppModeContext";
import { useGatewayStatus } from "../../context/GatewayStatusContext";
import { useSession } from "../../context/SessionContext";
import { useStatusBarInfo } from "../../hooks/useStatusBarInfo";
import { hasCloudAccess } from "../../lib/cloudAccess";
import {
  defaultSaveLocationPatch,
  getDefaultSaveLocationDisplay,
} from "../../lib/documentStorageConfig";
import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageSubtitle, getConsolePageTitle } from "../layout/consolePageMeta";
import { persistSettings, resolveSettings } from "../../lib/settingsStorage";
import { scrollToGatewaySettings } from "../../lib/gatewaySettingsNavigation";
import { normalizeAppSettings } from "../../lib/settingsScanHelpers";
import { DocumentSaveSuccessToast } from "../scan/offline/DocumentSaveSuccessToast";
import { ChooseLocalSaveFolderModal } from "../scan/offline/modals/ChooseLocalSaveFolderModal";
import { ResetSettingsModal } from "./ResetSettingsModal";
import { CloudTab } from "./CloudTab";
import { OcrTab } from "./OcrTab";
import { ScanDefaultsTab } from "./ScanDefaultsTab";
import { SecurityTab } from "./SecurityTab";
import { GatewayServerPanel } from "./GatewayServerPanel";
import { StorageTab } from "./StorageTab";
import { DEFAULT_SCANNED_DOCUMENTS_ROOT } from "../search/searchFolders";
import { SettingsRow, SettingsToggleRow } from "./SettingsRow";
import {
  DEFAULT_APP_SETTINGS,
  SETTINGS_TABS,
  type AppSettings,
  type SettingsTabId,
} from "./settingsData";
import "../../styles/settings-page.css";
import "../../styles/gateway-server-panel.css";
import "../../styles/scan-offline.css";

const SAVE_PREFERENCES_PATH = "/settings/save-preferences";

function resolveSettingsTab(state: unknown): SettingsTabId {
  const tab = (state as { tab?: string } | null)?.tab;
  if (tab && SETTINGS_TABS.some((entry) => entry.id === tab)) {
    return tab as SettingsTabId;
  }
  return "general";
}

function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-card">
      <h2 className="settings-card__title">{title}</h2>
      <div className="settings-card__body">{children}</div>
    </section>
  );
}

function GeneralTab({
  settings,
  onChange,
  onOpenSavePreferences,
  onPickDefaultFolder,
}: {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onOpenSavePreferences: () => void;
  onPickDefaultFolder: () => void;
}) {
  const defaultSaveLocation = getDefaultSaveLocationDisplay(settings);

  return (
    <div className="settings-page__grid settings-page__grid--general">
      <SettingsCard title="General">
        <SettingsRow label="Language" value={settings.language} />
        <SettingsRow label="Theme" value="Light" />
        <SettingsToggleRow
          label="Start app when system starts"
          checked={settings.startOnBoot}
          onChange={(startOnBoot) => onChange({ startOnBoot })}
        />
        <SettingsToggleRow
          label="Check for updates automatically"
          checked={settings.checkUpdates}
          onChange={(checkUpdates) => onChange({ checkUpdates })}
        />
        <SettingsRow
          label="Default save location"
          value={defaultSaveLocation}
          onClick={onPickDefaultFolder}
        />
        <SettingsRow
          label="Default file type"
          value={settings.defaultFileType}
          onClick={onOpenSavePreferences}
          showChevron={false}
        />
        <SettingsToggleRow
          label="Show recent scans on dashboard"
          checked={settings.showRecentScans}
          onChange={(showRecentScans) => onChange({ showRecentScans })}
        />
      </SettingsCard>

      <SettingsCard title="Save & Scan">
        <SettingsToggleRow
          label="Auto-open after scan"
          checked={settings.autoOpenAfterScan}
          onChange={(autoOpenAfterScan) => onChange({ autoOpenAfterScan })}
        />
        <SettingsRow label="Save naming pattern" value={settings.saveNamingPattern} />
        <SettingsRow
          label="Default Save Mode"
          value={settings.defaultSaveMode}
          onClick={onOpenSavePreferences}
          showChevron={false}
        />
        <SettingsRow
          label="Multiple Save Folders"
          value={settings.multipleSaveFolders}
          onClick={onOpenSavePreferences}
          showChevron={false}
        />
      </SettingsCard>

      <section className="settings-card" id="gateway-server-settings">
        <GatewayServerPanel compact />
      </section>
    </div>
  );
}

export function SettingsPageView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useAppMode();
  const { reachable: gatewayReachable } = useGatewayStatus();
  const { session } = useSession();
  const { lastSyncLabel } = useStatusBarInfo();
  const userId = session.userId;

  const [activeTab, setActiveTab] = useState<SettingsTabId>(() => resolveSettingsTab(location.state));
  const [settings, setSettings] = useState<AppSettings>(() => normalizeAppSettings(resolveSettings(userId)));
  const [savedSnapshot, setSavedSnapshot] = useState(settings);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);
  const [showDefaultFolderPicker, setShowDefaultFolderPicker] = useState(false);

  function openSavePreferences() {
    navigate(SAVE_PREFERENCES_PATH);
  }

  useEffect(() => {
    setActiveTab(resolveSettingsTab(location.state));
  }, [location.key, location.state]);

  useEffect(() => {
    if ((location.state as { focusGateway?: boolean } | null)?.focusGateway) {
      scrollToGatewaySettings();
    }
  }, [location.key, location.state]);

  useEffect(() => {
    const next = normalizeAppSettings(resolveSettings(userId));
    setSettings(next);
    setSavedSnapshot(next);
  }, [userId]);

  useEffect(() => {
    if (hasCloudAccess(isOnline, gatewayReachable) || !settings.cloudSync) return;
    setSettings((current) => normalizeAppSettings({ ...current, cloudSync: false }));
  }, [gatewayReachable, isOnline, settings.cloudSync]);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings((current) => normalizeAppSettings({ ...current, ...patch }));
  }

  function handleDefaultFolderPicked(path: string) {
    updateSettings(defaultSaveLocationPatch(path));
    setShowDefaultFolderPicker(false);
  }

  function handleSave() {
    const next = normalizeAppSettings(settings);
    if (userId != null) {
      persistSettings(userId, next);
    }
    setSettings(next);
    setSavedSnapshot(next);
    setShowSaveToast(true);
  }

  function handleReset() {
    const next = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      storageRoot: DEFAULT_SCANNED_DOCUMENTS_ROOT,
      cloudSync: false,
    });
    setSettings(next);
    if (userId != null) {
      persistSettings(userId, next);
    }
    setSavedSnapshot(next);
    setShowResetModal(false);
    setShowResetToast(true);
  }

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSnapshot);

  return (
    <div className="settings-page console-page" data-screen="section-07-settings">
      <ConsolePageHeader
        title={getConsolePageTitle("Settings")}
        subtitle={getConsolePageSubtitle("Settings")}
      />

      <div className="settings-page__content console-page__body">

        <div className="settings-page__tabs" role="tablist" aria-label="Settings sections">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`settings-page__tab${activeTab === tab.id ? " settings-page__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-page__panel" role="tabpanel">
          {activeTab === "general" ? (
            <GeneralTab
              settings={settings}
              onChange={updateSettings}
              onOpenSavePreferences={openSavePreferences}
              onPickDefaultFolder={() => setShowDefaultFolderPicker(true)}
            />
          ) : null}
          {activeTab === "scan-defaults" ? (
            <ScanDefaultsTab
              settings={settings}
              onChange={updateSettings}
              onOpenSavePreferences={openSavePreferences}
              onOpenResetModal={() => setShowResetModal(true)}
              onSave={handleSave}
              canSave={hasUnsavedChanges}
            />
          ) : null}
          {activeTab === "storage" ? (
            <StorageTab settings={settings} onChange={updateSettings} />
          ) : null}
          {activeTab === "cloud" ? (
            <CloudTab settings={settings} onChange={updateSettings} />
          ) : null}
          {activeTab === "ocr" ? (
            <OcrTab
              settings={settings}
              onChange={updateSettings}
              onOpenResetModal={() => setShowResetModal(true)}
              onSave={handleSave}
              canSave={hasUnsavedChanges}
            />
          ) : null}
          {activeTab === "security" ? (
            <SecurityTab settings={settings} isOnline={isOnline} onChange={updateSettings} />
          ) : null}
        </div>

        {activeTab !== "scan-defaults" && activeTab !== "ocr" ? (
          <div className="settings-page__actions">
            <button
              type="button"
              className="settings-btn settings-btn--outline"
              onClick={() => setShowResetModal(true)}
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              className="settings-btn settings-btn--primary"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              Save Changes
            </button>
          </div>
        ) : null}
      </div>

      {showResetModal ? (
        <ResetSettingsModal onCancel={() => setShowResetModal(false)} onConfirm={handleReset} />
      ) : null}

      {showDefaultFolderPicker ? (
        <ChooseLocalSaveFolderModal
          value={getDefaultSaveLocationDisplay(settings)}
          onApply={handleDefaultFolderPicked}
          onClose={() => setShowDefaultFolderPicker(false)}
          elevated
          usePortal
        />
      ) : null}

      {showSaveToast ? (
        <DocumentSaveSuccessToast
          label="CHANGES SAVED"
          title="Changes saved successfully"
          description="Your save mode, folder settings, and file naming were updated."
          onClose={() => setShowSaveToast(false)}
        />
      ) : null}

      {showResetToast ? (
        <DocumentSaveSuccessToast
          label="RESET"
          title="Settings reset successfully"
          description="Application settings were restored to their default values."
          onClose={() => setShowResetToast(false)}
        />
      ) : null}

      <footer className="settings-status-bar">
        <span className="settings-status-bar__item">
          <FolderOpen className="settings-status-bar__icon" strokeWidth={1.8} />
          Local Storage: {getDefaultSaveLocationDisplay(settings)}
        </span>
        <span className="settings-status-bar__item">
          <Database className="settings-status-bar__icon" strokeWidth={1.8} />
          Database: {settings.databaseType}
        </span>
        <span className="settings-status-bar__item">
          <Clock className="settings-status-bar__icon" strokeWidth={1.8} />
          Last Sync: {lastSyncLabel}
        </span>
      </footer>
    </div>
  );
}
