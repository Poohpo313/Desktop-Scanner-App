import { Calendar, ChevronDown, FolderOpen, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BrowseSearchFolderModal } from "./BrowseSearchFolderModal";
import { formatFolderLabel, type SearchFolderOption } from "./searchFolders";
import type { SearchFilters } from "./searchTypes";
import "../../styles/scan-offline.css";
const FILE_TYPE_OPTIONS = [
  { id: "pdf" as const, label: "PDF" },
  { id: "png" as const, label: "PNG" },
  { id: "jpeg" as const, label: "JPEG" },
  { id: "all" as const, label: "All" },
];

const DATE_OPTIONS = [
  { id: "any" as const, label: "Any time" },
  { id: "7" as const, label: "Last 7 days" },
  { id: "30" as const, label: "Last 30 days" },
  { id: "90" as const, label: "Last 90 days" },
  { id: "365" as const, label: "Last year" },
];

type AdvancedFiltersDrawerProps = {
  draft: SearchFilters;
  folderOptions: SearchFolderOption[];
  foldersLoading: boolean;
  onChange: (patch: Partial<SearchFilters>) => void;
  onApply: () => void;
  onClose: () => void;
};

export function AdvancedFiltersDrawer({
  draft,
  folderOptions,
  foldersLoading,
  onChange,
  onApply,
  onClose,
}: AdvancedFiltersDrawerProps) {
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const selectedFolderPath = draft.folder === "all" ? "" : draft.folder;
  const folderSelectOptions = useMemo(() => {
    if (draft.folder === "all" || folderOptions.some((folder) => folder.path === draft.folder)) {
      return folderOptions;
    }

    return [
      ...folderOptions,
      {
        id: draft.folder,
        label: formatFolderLabel(draft.folder),
        path: draft.folder,
      },
    ];
  }, [draft.folder, folderOptions]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <>
      <div className="search-filters-backdrop" role="presentation" onClick={onClose}>
        <aside
          className="search-filters-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-filters-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="search-filters-drawer__header">
            <h2 id="search-filters-title" className="search-filters-drawer__title">
              Advanced Filters
            </h2>
            <button
              type="button"
              className="search-filters-drawer__close"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </header>

          <div className="search-filters-drawer__scroll">
            <div className="search-filters-drawer__fields">
              <label className="search-filter-field">
                <span className="search-filter-field__label">File Type</span>
                <div className="search-filter-pills">
                  {FILE_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`search-filter-pill${
                        draft.fileType === option.id ? " search-filter-pill--active" : ""
                      }`}
                      onClick={() => onChange({ fileType: option.id })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </label>

              <label className="search-filter-field">
                <span className="search-filter-field__label">Date Scanned</span>
                <div className="search-filter-select-wrap">
                  <select
                    className="search-filter-select"
                    value={draft.date}
                    onChange={(event) => onChange({ date: event.target.value as SearchFilters["date"] })}
                  >
                    {DATE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Calendar className="search-filter-select__icon" strokeWidth={1.8} />
                </div>
              </label>

              <div className="search-filter-field">
                <span className="search-filter-field__label">Folder / Department</span>
                <p className="search-filter-field__note">
                  Browse local storage folders where your scanned documents are saved.
                </p>
                <div className="search-filter-folder-row">
                  <div className="search-filter-select-wrap search-filter-select-wrap--grow">
                    <select
                      className="search-filter-select"
                      value={draft.folder}
                      disabled={foldersLoading}
                      onChange={(event) => onChange({ folder: event.target.value })}
                    >
                      <option value="all">All folders</option>
                      {folderSelectOptions.map((folder) => (
                        <option key={folder.id} value={folder.path} title={folder.path}>
                          {folder.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="search-filter-select__icon" strokeWidth={1.8} />
                  </div>
                  <button
                    type="button"
                    className="search-btn search-btn--outline search-filter-folder-row__browse"
                    onClick={() => setShowFolderPicker(true)}
                  >
                    <FolderOpen className="h-4 w-4" strokeWidth={1.8} />
                    Browse
                  </button>
                </div>
                {selectedFolderPath ? (
                  <p className="search-filter-folder-path" title={selectedFolderPath}>
                    {selectedFolderPath}
                  </p>
                ) : null}
              </div>

              <label className="search-filter-field search-filter-field--last">
                <span className="search-filter-field__label">OCR Contains</span>
                <input
                  type="text"
                  className="search-filter-input"
                  placeholder="Enter text found in document"
                  value={draft.ocrContains}
                  onChange={(event) => onChange({ ocrContains: event.target.value })}
                />
              </label>
            </div>

            <div className="search-filters-drawer__actions">
              <button type="button" className="search-btn search-btn--primary" onClick={onApply}>
                Apply Filters
              </button>
            </div>

            <div className="search-filters-drawer__scroll-end" aria-hidden="true" />
          </div>
        </aside>
      </div>

      {showFolderPicker ? (
        <BrowseSearchFolderModal
          value={selectedFolderPath}
          onApply={(path) => {
            onChange({ folder: path });
            setShowFolderPicker(false);
          }}
          onClose={() => setShowFolderPicker(false)}
        />
      ) : null}
    </>,
    document.body,
  );
}
