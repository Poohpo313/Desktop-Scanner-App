import { ChevronRight, FileText, Folder, FolderOpen, HardDrive, Info, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DEFAULT_LOCAL_PRINT_BROWSE_PATH,
  listDemoPrintFiles,
  type LocalPrintFile,
} from "../../lib/localPrintFiles";
import { listDemoFolders } from "../../lib/localFolderTree";
import { useLocalFilesystem, type DirectoryEntry, type QuickLocation } from "../scan/offline/useLocalFilesystem";
import { ScanModalShell } from "../scan/offline/modals/ScanModalShell";

type BrowseLocalPrintFileModalProps = {
  onApply: (file: LocalPrintFile) => void;
  onClose: () => void;
};

const LOCATION_ICONS: Record<string, typeof Monitor> = {
  home: Monitor,
  desktop: Monitor,
  documents: Folder,
  downloads: Folder,
  "disk-c": HardDrive,
};

function iconForLocation(id: string) {
  if (id.startsWith("disk-")) return HardDrive;
  return LOCATION_ICONS[id] ?? Folder;
}

function matchQuickLocation(locations: QuickLocation[], path: string) {
  return locations.find((loc) => path === loc.path || path.startsWith(`${loc.path}\\`));
}

export function BrowseLocalPrintFileModal({ onApply, onClose }: BrowseLocalPrintFileModalProps) {
  const { getQuickLocations, listContents, pickFolder } = useLocalFilesystem();
  const [locations, setLocations] = useState<QuickLocation[]>([]);
  const [folders, setFolders] = useState<DirectoryEntry[]>([]);
  const [files, setFiles] = useState<LocalPrintFile[]>([]);
  const [currentPath, setCurrentPath] = useState(DEFAULT_LOCAL_PRINT_BROWSE_PATH);
  const [selectedFile, setSelectedFile] = useState<LocalPrintFile | null>(null);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  async function loadPath(path: string) {
    setLoadingFolders(true);
    setFolderError(null);

    const result = await listContents(path);
    const useDemoFallback = !window.bukolabs?.filesystem?.listContents;
    const nextFolders =
      result.folders.length > 0 ? result.folders : useDemoFallback ? listDemoFolders(path) : [];
    const printableFiles: LocalPrintFile[] =
      result.files.length > 0
        ? result.files.map((file) => ({
            name: file.name,
            path: file.path,
            pages: 1,
          }))
        : useDemoFallback
          ? listDemoPrintFiles(result.path)
          : [];

    setCurrentPath(result.path);
    setFolders(nextFolders);
    setFiles(printableFiles);
    setSelectedFile((current) => {
      if (current && printableFiles.some((file) => file.path === current.path)) {
        return current;
      }
      return printableFiles[0] ?? null;
    });

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
      const matchedLocation = matchQuickLocation(quickLocations, DEFAULT_LOCAL_PRINT_BROWSE_PATH);
      setActiveLocationId(matchedLocation?.id ?? null);
      await loadPath(DEFAULT_LOCAL_PRINT_BROWSE_PATH);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [getQuickLocations]);

  async function handleLocationSelect(location: QuickLocation) {
    setActiveLocationId(location.id);
    await loadPath(location.path);
  }

  async function handleFolderSelect(folder: DirectoryEntry) {
    await loadPath(folder.path);
  }

  async function handleSystemPicker() {
    const result = await pickFolder(currentPath);
    if (!result.canceled && result.path) {
      const matched = matchQuickLocation(locations, result.path);
      if (matched) {
        setActiveLocationId(matched.id);
      }
      await loadPath(result.path);
    }
  }

  return (
    <ScanModalShell
      wide
      elevated
      usePortal
      title="Browse Local File"
      subtitle="Choose a PDF, image, or document from a folder on this computer."
      onClose={onClose}
      footer={
        <>
          <p className="scan-folder-footer-path">
            Selected file: <strong>{selectedFile?.name ?? "—"}</strong>
          </p>
          <div className="scan-folder-footer-actions">
            <button type="button" className="scan-btn scan-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="scan-btn scan-btn--secondary" onClick={() => void handleSystemPicker()}>
              <FolderOpen className="h-4 w-4" strokeWidth={1.8} />
              Open Folder Picker
            </button>
            <button
              type="button"
              className="scan-btn scan-btn--primary"
              disabled={!selectedFile}
              onClick={() => {
                if (selectedFile) {
                  onApply(selectedFile);
                  onClose();
                }
              }}
            >
              Continue
            </button>
          </div>
        </>
      }
    >
      <div className="scan-folder-alert">
        <Info className="scan-folder-alert__icon" strokeWidth={2} />
        <div>
          <strong>Local files only</strong>
          <p>
            Browse folders on this device and select a printable file. Cloud and shared folders are
            unavailable while offline.
          </p>
        </div>
      </div>

      <div className="scan-folder-current">
        <span className="scan-folder-current__label">Current Location</span>
        <button
          type="button"
          className="scan-folder-current__path scan-folder-current__path--button"
          onClick={() => void handleSystemPicker()}
        >
          <Folder className="h-4 w-4 shrink-0 text-[#008768]" strokeWidth={1.8} />
          {currentPath || "Select a folder"}
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
          <h3 className="scan-folder-column__title">Folders</h3>
          {loadingFolders ? (
            <p className="scan-folder-empty">Loading folders…</p>
          ) : folderError ? (
            <p className="scan-folder-empty scan-folder-empty--error">{folderError}</p>
          ) : folders.length === 0 ? (
            <p className="scan-folder-empty">No subfolders in this location.</p>
          ) : (
            <ul className="scan-folder-list">
              {folders.map((folder) => (
                <li key={folder.path}>
                  <button
                    type="button"
                    className="scan-folder-list__item scan-folder-list__item--folder"
                    onClick={() => void handleFolderSelect(folder)}
                  >
                    <Folder className="h-4 w-4 shrink-0 text-[#008768]" strokeWidth={1.8} />
                    <span className="flex-1 text-left">{folder.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="print-document-list print-document-list--browse">
        <h3 className="print-document-list__heading">Files in this folder</h3>
        {files.length === 0 ? (
          <p className="print-document-list__empty">
            No printable files in this folder. Open another folder or use the folder picker.
          </p>
        ) : (
          files.map((file) => {
            const active = selectedFile?.path === file.path;
            return (
              <button
                key={file.path}
                type="button"
                className={`print-document-list__item${active ? " print-document-list__item--active" : ""}`}
                onClick={() => setSelectedFile(file)}
              >
                <span className="print-document-list__file">
                  <FileText className="print-document-list__file-icon" strokeWidth={1.8} />
                  <span className="print-document-list__name">{file.name}</span>
                </span>
                <span className="print-document-list__pages">
                  {file.pages} {file.pages === 1 ? "page" : "pages"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </ScanModalShell>
  );
}
