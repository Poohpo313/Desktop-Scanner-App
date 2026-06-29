import { ChevronRight, Folder, FolderOpen, HardDrive, Info, Monitor } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "../../../../context/SessionContext";
import { useAppMode } from "../../../../context/AppModeContext";
import { resolveSettings } from "../../../../lib/settingsStorage";
import { DEFAULT_SCANNED_DOCUMENTS_ROOT } from "../../../search/searchFolders";
import { useLocalFilesystem, type DirectoryEntry, type QuickLocation } from "../useLocalFilesystem";
import { ScanModalShell } from "./ScanModalShell";

type ChooseLocalSaveFolderModalProps = {
  value: string;
  onApply: (path: string) => void;
  onClose: () => void;
  purpose?: "save" | "search";
  elevated?: boolean;
  usePortal?: boolean;
};

const LOCATION_ICONS: Record<string, typeof Monitor> = {
  home: Monitor,
  desktop: Monitor,
  documents: Folder,
  downloads: Folder,
  "disk-c": HardDrive,
  "disk-d": HardDrive,
};

function iconForLocation(id: string) {
  if (id.startsWith("disk-")) return HardDrive;
  return LOCATION_ICONS[id] ?? Folder;
}

function matchQuickLocation(locations: QuickLocation[], path: string) {
  return locations.find((loc) => path === loc.path || path.startsWith(`${loc.path}\\`));
}

export function ChooseLocalSaveFolderModal({
  value,
  onApply,
  onClose,
  purpose = "save",
  elevated = false,
  usePortal = false,
}: ChooseLocalSaveFolderModalProps) {
  const isSearch = purpose === "search";
  const { isOnline } = useAppMode();
  const { session } = useSession();
  const cloudSyncEnabled = useMemo(
    () => resolveSettings(session.userId).cloudSync,
    [session.userId],
  );
  const { getQuickLocations, listDirectories, pickFolder } = useLocalFilesystem();
  const [locations, setLocations] = useState<QuickLocation[]>([]);
  const [folders, setFolders] = useState<DirectoryEntry[]>([]);
  const [selectedPath, setSelectedPath] = useState(value);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  async function loadFolders(path: string) {
    setLoadingFolders(true);
    setFolderError(null);
    const result = await listDirectories(path);
    setSelectedPath(result.path);
    setFolders(result.folders);
    if (result.error) {
      setFolderError(result.error);
    }
    setLoadingFolders(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { locations: quickLocations } = await getQuickLocations();
      if (cancelled) return;

      setLocations(quickLocations);

      const trimmedValue = value.trim();
      if (trimmedValue) {
        const matchedLocation = matchQuickLocation(quickLocations, trimmedValue);
        setActiveLocationId(matchedLocation?.id ?? null);
        await loadFolders(trimmedValue);
        return;
      }

      const defaultLocation = isSearch
        ? (quickLocations.find((loc) => loc.id === "home") ??
          quickLocations.find((loc) => loc.id === "documents") ??
          quickLocations[0])
        : (quickLocations.find((loc) => loc.id === "documents") ?? quickLocations[0]);

      const initial = isSearch
        ? DEFAULT_SCANNED_DOCUMENTS_ROOT
        : defaultLocation?.path;

      if (!initial) return;

      const matchedLocation = matchQuickLocation(quickLocations, initial) ?? defaultLocation;
      setActiveLocationId(matchedLocation?.id ?? null);
      await loadFolders(initial);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [getQuickLocations, isSearch, value]);

  async function handleLocationSelect(location: QuickLocation) {
    setActiveLocationId(location.id);
    await loadFolders(location.path);
  }

  async function handleFolderSelect(folder: DirectoryEntry) {
    await loadFolders(folder.path);
  }

  async function handleSystemPicker() {
    const result = await pickFolder(selectedPath);
    if (!result.canceled && result.path) {
      setSelectedPath(result.path);
      const matched = matchQuickLocation(locations, result.path);
      if (matched) {
        setActiveLocationId(matched.id);
      }
      await loadFolders(result.path);
    }
  }

  const modalSubtitle = isSearch
    ? "Choose a folder on this device to search for saved documents."
    : isOnline
      ? "Select a folder for your paper routing / save location."
      : "Browse folders on this device. Scanned files will be saved locally while offline.";

  const showOfflineFolderAlert = !isSearch && !isOnline;
  const showCloudSyncOffNotice = !isSearch && !cloudSyncEnabled;

  return (
    <ScanModalShell
      title={isSearch ? "Browse Local Folder" : "Choose Local Save Folder"}
      subtitle={modalSubtitle}
      wide
      elevated={elevated}
      usePortal={usePortal}
      onClose={onClose}
      footer={
        <>
          <p className="scan-folder-footer-path">
            {isSearch ? "Search folder:" : "Selected path:"}{" "}
            <strong>{selectedPath || "—"}</strong>
          </p>
          <div className="scan-folder-footer-actions">
            <button type="button" className="scan-btn scan-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="scan-btn scan-btn--secondary" onClick={() => void handleSystemPicker()}>
              <FolderOpen className="h-4 w-4" strokeWidth={1.8} />
              {isSearch ? "Open Folder Picker" : "Open System Folder Picker"}
            </button>
            <button
              type="button"
              className="scan-btn scan-btn--primary"
              disabled={!selectedPath}
              onClick={() => {
                if (selectedPath) {
                  onApply(selectedPath);
                  onClose();
                }
              }}
            >
              {isSearch ? "Apply to Search" : "Use This Folder"}
            </button>
          </div>
        </>
      }
    >
      {showOfflineFolderAlert ? (
        <div className="scan-folder-alert">
          <Info className="scan-folder-alert__icon" strokeWidth={2} />
          <div>
            <strong>Local device folders</strong>
            <p>
              Folders listed here come from your computer. Cloud, shared department, and remote
              archive locations are unavailable while offline.
            </p>
          </div>
        </div>
      ) : null}

      {isSearch ? (
        <div className="scan-folder-alert">
          <Info className="scan-folder-alert__icon" strokeWidth={2} />
          <div>
            <strong>Search local folders</strong>
            <p>
              Folders listed here come from your computer. Pick a location to search documents stored
              on this device.
            </p>
          </div>
        </div>
      ) : null}

      <div className="scan-folder-current">
        <span className="scan-folder-current__label">
          {isSearch ? "Browsing" : "Current Location"}
        </span>
        <button
          type="button"
          className="scan-folder-current__path scan-folder-current__path--button"
          onClick={() => void handleSystemPicker()}
        >
          <Folder className="h-4 w-4 shrink-0 text-[#008768]" strokeWidth={1.8} />
          {selectedPath || "Select a folder"}
        </button>
      </div>

      <div className="scan-folder-columns">
        <div className="scan-folder-column">
          <h3 className="scan-folder-column__title">Quick Locations</h3>
          <ul className="scan-folder-list">
            {locations.map((loc) => {
              const Icon = iconForLocation(loc.id);
              const active = activeLocationId === loc.id;
              return (
                <li key={loc.id}>
                  <button
                    type="button"
                    className={`scan-folder-list__item${active ? " scan-folder-list__item--active" : ""}`}
                    onClick={() => void handleLocationSelect(loc)}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                    {loc.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="scan-folder-column">
          <h3 className="scan-folder-column__title">Folders in this location</h3>
          {loadingFolders ? (
            <p className="scan-folder-empty">Loading folders…</p>
          ) : folderError ? (
            <p className="scan-folder-empty scan-folder-empty--error">{folderError}</p>
          ) : folders.length === 0 ? (
            <p className="scan-folder-empty">
              No subfolders here. You can still {isSearch ? "search in" : "save to"} this folder, or use
              the {isSearch ? "folder picker" : "system folder picker"}.
            </p>
          ) : (
            <ul className="scan-folder-list">
              {folders.map((folder) => {
                const selected = selectedPath === folder.path;
                return (
                  <li key={folder.path}>
                    <button
                      type="button"
                      className={`scan-folder-list__item scan-folder-list__item--folder${
                        selected ? " scan-folder-list__item--current" : ""
                      }`}
                      onClick={() => void handleFolderSelect(folder)}
                    >
                      <Folder className="h-4 w-4 shrink-0 text-[#008768]" strokeWidth={1.8} />
                      <span className="flex-1 text-left">{folder.name}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {!isSearch && showCloudSyncOffNotice ? (
        <div className="scan-folder-warning">
          {isOnline
            ? "Cloud Sync is currently off. Files saved here will remain on this device until you enable Cloud Sync in Settings."
            : "Cloud Sync is currently off. Files saved here will remain on this device until you connect to the internet and enable Cloud Sync."}
        </div>
      ) : null}
    </ScanModalShell>
  );
}
