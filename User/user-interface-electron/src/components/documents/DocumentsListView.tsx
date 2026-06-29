import { Filter, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDocuments } from "../../context/DocumentsContext";
import { formatDocumentDateTime, type SavedDocument } from "../../lib/documents";
import { SelectionModal } from "../scan/offline/modals/SelectionModal";
import { DashboardAdvancedFiltersModal } from "../dashboard/DashboardAdvancedFiltersModal";
import {
  DASHBOARD_DATE_RANGE_OPTIONS,
  DASHBOARD_DEPARTMENT_OPTIONS,
  DASHBOARD_SORT_OPTIONS,
  dashboardDateRangeLabel,
  dashboardSortLabel,
  type DashboardDateRangeId,
  type DashboardDepartmentFilterId,
  type DashboardFileTypeFilter,
  type DashboardSortId,
} from "../dashboard/dashboardData";
import "../../styles/dashboard-filters-modal.css";
import "../../styles/scan-offline.css";

function FileTypeBadge({ type }: { type: string }) {
  const slug = type.toLowerCase();
  return <span className={`dash-file-badge dash-file-badge--${slug}`}>{type}</span>;
}

type DashboardModal = "sort" | "date-range" | "department" | "advanced" | null;

type DocumentsListViewProps = {
  title?: string;
  showViewAll?: boolean;
  compact?: boolean;
};

function matchesSearch(file: SavedDocument, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  return [file.fileName, file.department, file.fileType]
    .join(" ")
    .toLowerCase()
    .includes(trimmed);
}

function matchesDateRange(file: SavedDocument, rangeId: DashboardDateRangeId): boolean {
  if (rangeId === "all") return true;
  const days = Number(rangeId);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(file.modifiedAt).getTime() >= cutoff;
}

function matchesFileType(file: SavedDocument, fileType: DashboardFileTypeFilter): boolean {
  if (fileType === "all") return true;
  if (fileType === "docx") return false;
  return file.fileType.toLowerCase() === fileType;
}

function matchesDepartment(file: SavedDocument, departmentId: DashboardDepartmentFilterId): boolean {
  if (departmentId === "all") return true;
  return file.departmentId === departmentId;
}

function sortDocuments(files: SavedDocument[], sortId: DashboardSortId): SavedDocument[] {
  const next = [...files];
  if (sortId === "newest") {
    return next.sort(
      (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
    );
  }
  if (sortId === "oldest") {
    return next.sort(
      (a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime(),
    );
  }
  if (sortId === "name-az") {
    return next.sort((a, b) => a.fileName.localeCompare(b.fileName));
  }
  return next.sort((a, b) => b.fileName.localeCompare(a.fileName));
}

export function DocumentsListView({
  title = "Documents",
  showViewAll = false,
  compact = false,
}: DocumentsListViewProps) {
  const { documents } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortId, setSortId] = useState<DashboardSortId>("newest");
  const [dateRangeId, setDateRangeId] = useState<DashboardDateRangeId>("30");
  const [departmentId, setDepartmentId] = useState<DashboardDepartmentFilterId>("all");
  const [fileTypeFilter, setFileTypeFilter] = useState<DashboardFileTypeFilter>("all");
  const [draftFileTypeFilter, setDraftFileTypeFilter] = useState<DashboardFileTypeFilter>("all");
  const [draftDepartmentId, setDraftDepartmentId] = useState<DashboardDepartmentFilterId>("all");
  const [modal, setModal] = useState<DashboardModal>(null);
  const [departmentFromAdvanced, setDepartmentFromAdvanced] = useState(false);

  const filteredDocuments = useMemo(() => {
    const filtered = documents.filter(
      (file) =>
        matchesSearch(file, searchQuery) &&
        matchesDateRange(file, dateRangeId) &&
        matchesFileType(file, fileTypeFilter) &&
        matchesDepartment(file, departmentId),
    );
    return sortDocuments(filtered, sortId);
  }, [dateRangeId, departmentId, documents, fileTypeFilter, searchQuery, sortId]);

  const visibleDocuments = compact ? filteredDocuments.slice(0, 5) : filteredDocuments;
  const empty = visibleDocuments.length === 0;
  const modalPortal = compact;

  function openAdvancedFilters() {
    setDraftFileTypeFilter(fileTypeFilter === "all" ? "pdf" : fileTypeFilter);
    setDraftDepartmentId(departmentId);
    setModal("advanced");
  }

  function openDepartmentFromAdvanced() {
    setDepartmentFromAdvanced(true);
    setModal("department");
  }

  function applyAdvancedFilters() {
    setFileTypeFilter(draftFileTypeFilter);
    setDepartmentId(draftDepartmentId);
    setModal(null);
  }

  function resetAdvancedFilters() {
    setDraftFileTypeFilter("pdf");
    setDraftDepartmentId("all");
  }

  return (
    <>
      <section className={`dash-panel${compact ? "" : " documents-page__panel"}`}>
        <div className="dash-panel__header">
          <h2 className="dash-panel__title">{title}</h2>
          {showViewAll ? (
            <Link to="/files" className="dash-panel__view-all">
              View all
            </Link>
          ) : null}
        </div>

        <div className="dash-panel__toolbar">
          <input
            type="search"
            className="dash-panel__search"
            placeholder="Search files..."
            aria-label="Search files"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <label className="dash-panel__control">
            <span className="dash-panel__control-label">Date Range</span>
            <button
              type="button"
              className="dash-panel__select-btn"
              onClick={() => setModal("date-range")}
            >
              {dashboardDateRangeLabel(dateRangeId)}
            </button>
          </label>
          <label className="dash-panel__control">
            <span className="dash-panel__control-label">Sort By</span>
            <button type="button" className="dash-panel__select-btn" onClick={() => setModal("sort")}>
              {dashboardSortLabel(sortId)}
            </button>
          </label>
          <button
            type="button"
            className="dash-panel__filter-icon"
            aria-label="Advanced filters"
            onClick={openAdvancedFilters}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Pages</th>
                <th>Department</th>
                <th>Date Modified</th>
                {!compact ? <th>Location</th> : null}
              </tr>
            </thead>
            <tbody>
              {empty ? (
                <tr>
                  <td colSpan={compact ? 4 : 5} className="dash-table__empty">
                    {documents.length === 0
                      ? "No documents yet. Scan a document to see it listed here."
                      : "No files match your current filters."}
                  </td>
                </tr>
              ) : (
                visibleDocuments.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <span className="dash-table__file">
                        <FileTypeBadge type={file.fileType} />
                        {compact ? (
                          <span className="dash-table__name">{file.fileName}</span>
                        ) : (
                          <button type="button" className="dash-table__name-btn">
                            {file.fileName}
                          </button>
                        )}
                      </span>
                    </td>
                    <td>
                      {file.pages} page{file.pages === 1 ? "" : "s"}
                    </td>
                    <td>{file.department}</td>
                    <td className="dash-table__muted">{formatDocumentDateTime(file.modifiedAt)}</td>
                    {!compact ? (
                      <td className="dash-table__muted dash-table__path">{file.savePath}</td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {fileTypeFilter !== "all" || departmentId !== "all" ? (
          <div className="dash-panel__active-filters">
            <Filter className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>Filters applied</span>
          </div>
        ) : null}
      </section>

      {modal === "sort" ? (
        <SelectionModal
          title="Sort Files"
          subtitle="Choose how recent files are ordered."
          options={DASHBOARD_SORT_OPTIONS}
          value={sortId}
          showSummary={false}
          usePortal={modalPortal}
          elevated={modalPortal}
          onApply={(value) => setSortId(value as DashboardSortId)}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "date-range" ? (
        <SelectionModal
          title="Date Range"
          subtitle="Limit recent files to a selected time period."
          options={DASHBOARD_DATE_RANGE_OPTIONS.map((option) => ({
            id: option.id,
            label: option.label,
          }))}
          value={dateRangeId}
          showSummary={false}
          usePortal={modalPortal}
          elevated={modalPortal}
          onApply={(value) => setDateRangeId(value as DashboardDateRangeId)}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "department" ? (
        <SelectionModal
          title="Filter by Department"
          options={DASHBOARD_DEPARTMENT_OPTIONS}
          value={draftDepartmentId}
          showSummary={false}
          usePortal={modalPortal}
          elevated={modalPortal}
          closeOnApply={!departmentFromAdvanced}
          onApply={(value) => {
            setDraftDepartmentId(value as DashboardDepartmentFilterId);
            if (departmentFromAdvanced) {
              setDepartmentFromAdvanced(false);
              setModal("advanced");
              return;
            }
            setDepartmentId(value as DashboardDepartmentFilterId);
            setModal(null);
          }}
          onClose={() => {
            if (departmentFromAdvanced) {
              setDepartmentFromAdvanced(false);
              setModal("advanced");
              return;
            }
            setModal(null);
          }}
        />
      ) : null}

      {modal === "advanced" ? (
        <DashboardAdvancedFiltersModal
          fileType={draftFileTypeFilter}
          departmentId={draftDepartmentId}
          onFileTypeChange={setDraftFileTypeFilter}
          onOpenDepartmentFilter={openDepartmentFromAdvanced}
          onReset={resetAdvancedFilters}
          onApply={applyAdvancedFilters}
          onClose={() => setModal(null)}
        />
      ) : null}
    </>
  );
}
