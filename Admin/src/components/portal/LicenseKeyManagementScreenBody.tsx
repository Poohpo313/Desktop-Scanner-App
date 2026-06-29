import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from "react";
import ModernDatePicker, { EMPTY_DATE_RANGE, type DateRangeValue } from "../ModernDatePicker";
import {
  IconLicenseKeyUnused,
  IconLicenseKeyUsed,
  IconSearch,
} from "../icons/AdminIcons";
import FilterPickerDropdown from "./FilterPickerDropdown";
import PortalOverlay from "./PortalOverlay";
import ExportSuccessfulModal from "./ExportSuccessfulModal";
import LicenseKeyRevokeRequestModal, {
  type LicenseKeyRevokeRequestPayload,
} from "./LicenseKeyRevokeRequestModal";
import LicenseKeyRevokeRequestSubmittedModal from "./LicenseKeyRevokeRequestSubmittedModal";
import { useNotificationStore } from "../../store/notificationStore";
import { useRegisterExportAction } from "../../hooks/useRegisterExportAction";
import {
  LICENSE_KEY_CATALOG_ASSIGNED_ORGANIZATION,
  LICENSE_KEY_CATALOG_ASSIGNED_SERIAL_KEYS,
  LICENSE_KEY_CATALOG_DEPARTMENTS,
  LICENSE_KEY_CATALOG_PAGE_SIZE,
  LICENSE_KEY_CATALOG_STATUS_OPTIONS,
  buildLicenseKeyCatalogForAssignedOrganization,
  exportLicenseKeyCatalogCsv,
  filterLicenseKeyCatalogRows,
  getLicenseKeyCatalogDepartmentLabel,
  getLicenseKeyCatalogSummaryStats,
  type LicenseKeyCatalogDepartmentFilter,
  type LicenseKeyCatalogExportResult,
  type LicenseKeyCatalogRow,
  type LicenseKeyCatalogStatusFilter,
} from "../../data/demoLicenseKeyCatalog";
import "../../styles/license-key-catalog-screen.css";
import "../../styles/filter-picker-modal.css";
import "../../styles/license-key-revoke-request-modal.css";
import "../../styles/license-key-revoke-request-submitted-modal.css";
import "../../styles/export-successful-modal.css";

function paginationItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, "ellipsis", total];
  }

  if (current >= total - 2) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }

  return [1, "ellipsis", current, current + 1, "ellipsis", total];
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9 3.5L5.5 7L9 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5.5 3.5L9 7L5.5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.25" y="3.25" width="9.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M6 3.25V2.25H10V3.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M6 6.25H6.75M6 8.25H6.75M9.25 6.25H10M9.25 8.25H10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  exportKeysHandlerRef?: MutableRefObject<(() => void | Promise<void>) | null>;
  rows?: LicenseKeyCatalogRow[];
  assignedOrganization?: string;
  assignedSerialKeys?: number;
  summaryStats?: { used: number; unused: number };
  departmentOptions?: Array<{ value: string; label: string }>;
  onRevokeSubmit?: (
    row: LicenseKeyCatalogRow,
    payload: LicenseKeyRevokeRequestPayload,
  ) => void | Promise<void>;
};

export default function LicenseKeyManagementScreenBody({
  exportKeysHandlerRef,
  rows,
  assignedOrganization,
  assignedSerialKeys,
  summaryStats: summaryStatsProp,
  departmentOptions,
  onRevokeSubmit,
}: Props) {
  const push = useNotificationStore((state) => state.push);
  const catalog = useMemo(
    () => rows ?? buildLicenseKeyCatalogForAssignedOrganization(),
    [rows],
  );
  const summaryStats = summaryStatsProp ?? getLicenseKeyCatalogSummaryStats();
  const organizationName = assignedOrganization ?? LICENSE_KEY_CATALOG_ASSIGNED_ORGANIZATION.name;
  const assignedKeyCount = assignedSerialKeys ?? LICENSE_KEY_CATALOG_ASSIGNED_SERIAL_KEYS;
  const departments = departmentOptions ?? LICENSE_KEY_CATALOG_DEPARTMENTS;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LicenseKeyCatalogStatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState<LicenseKeyCatalogDepartmentFilter>("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>(EMPTY_DATE_RANGE);
  const [page, setPage] = useState(1);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [departmentPickerOpen, setDepartmentPickerOpen] = useState(false);
  const [revokeRequestOpen, setRevokeRequestOpen] = useState(false);
  const [revokeSubmittedOpen, setRevokeSubmittedOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<LicenseKeyCatalogRow | null>(null);
  const [exportDetails, setExportDetails] = useState<LicenseKeyCatalogExportResult | null>(null);

  const statusLabel =
    LICENSE_KEY_CATALOG_STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "All";
  const departmentLabel =
    departments.find((option) => String(option.value) === String(departmentFilter))?.label ??
    "All Department";

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, departmentFilter, dateRange]);

  const filteredRows = useMemo(() => {
    const base = filterLicenseKeyCatalogRows(
      catalog,
      searchQuery,
      statusFilter,
      departmentFilter,
      dateRange,
    );

    if (!departmentOptions || departmentFilter === "all") {
      return base;
    }

    return base.filter((row) => row.department === departmentFilter);
  }, [catalog, searchQuery, statusFilter, departmentFilter, dateRange, departmentOptions]);

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / LICENSE_KEY_CATALOG_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * LICENSE_KEY_CATALOG_PAGE_SIZE;
  const pageRows = filteredRows.slice(pageStart, pageStart + LICENSE_KEY_CATALOG_PAGE_SIZE);
  const showingFrom = pageRows.length === 0 ? 0 : pageStart + 1;
  const showingTo = pageStart + pageRows.length;
  const pageNumbers = paginationItems(currentPage, totalPages);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const runExport = useCallback(async () => {
    try {
      const result = await exportLicenseKeyCatalogCsv(filteredRows);
      setExportDetails(result);
    } catch {
      push("Export failed. Please try again.", "error");
    }
  }, [filteredRows, push]);

  useRegisterExportAction(exportKeysHandlerRef, runExport);

  const closeExportSuccess = () => {
    setExportDetails(null);
  };

  const openRevokeRequest = (row: LicenseKeyCatalogRow) => {
    setRevokeTarget(row);
    setRevokeRequestOpen(true);
  };

  const closeRevokeRequest = () => {
    setRevokeRequestOpen(false);
    setRevokeTarget(null);
  };

  const handleRevokeSubmit = async (payload: LicenseKeyRevokeRequestPayload) => {
    if (onRevokeSubmit && revokeTarget) {
      try {
        await onRevokeSubmit(revokeTarget, payload);
        setRevokeRequestOpen(false);
        setRevokeSubmittedOpen(true);
        setRevokeTarget(null);
      } catch {
        push("Revoke request failed. Please try again.", "error");
      }
      return;
    }

    setRevokeRequestOpen(false);
    setRevokeSubmittedOpen(true);
    setRevokeTarget(null);
  };

  const closeRevokeSubmitted = () => {
    setRevokeSubmittedOpen(false);
  };

  return (
    <div className="admin-shell__content license-key-catalog">
      <div className="license-key-catalog__context">
        <div className="license-key-catalog__assigned">
          <span className="license-key-catalog__context-label">Number of serial keys assigned</span>
          <input
            type="text"
            className="license-key-catalog__assigned-value"
            readOnly
            value={assignedKeyCount.toLocaleString()}
            aria-label="Number of serial keys assigned"
            tabIndex={-1}
          />
        </div>

        <div className="license-key-catalog__organization">
          <span className="license-key-catalog__organization-icon" aria-hidden="true">
            <IconBuilding />
          </span>
          <span className="license-key-catalog__context-label">Organization:</span>
          <input
            type="text"
            className="license-key-catalog__organization-value"
            readOnly
            value={organizationName}
            aria-label="Organization"
            tabIndex={-1}
          />
        </div>

        <button type="button" className="license-key-catalog__export-btn" onClick={() => void runExport()}>
          Export Keys
        </button>
      </div>

      <div className="license-key-catalog__stats">
        <div className="license-key-catalog__stat">
          <div className="license-key-catalog__stat-body">
            <span className="license-key-catalog__stat-icon license-key-catalog__stat-icon--used" aria-hidden="true">
              <IconLicenseKeyUsed width={22} height={22} />
            </span>
            <div className="license-key-catalog__stat-content">
              <span className="license-key-catalog__stat-label">Used</span>
              <div className="license-key-catalog__stat-value">{summaryStats.used.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="license-key-catalog__stat">
          <div className="license-key-catalog__stat-body">
            <span className="license-key-catalog__stat-icon license-key-catalog__stat-icon--unused" aria-hidden="true">
              <IconLicenseKeyUnused width={22} height={22} />
            </span>
            <div className="license-key-catalog__stat-content">
              <span className="license-key-catalog__stat-label">Unused</span>
              <div className="license-key-catalog__stat-value">{summaryStats.unused.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="license-key-catalog__filters">
        <label className="license-key-catalog__search">
          <IconSearch className="license-key-catalog__search-icon" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search keys"
            aria-label="Search keys"
          />
        </label>

        <div className="license-key-catalog__filter-container">
          <FilterPickerDropdown
            title="Select Department"
            options={departments.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            value={departmentFilter}
            triggerLabel={departmentLabel}
            ariaLabel="Filter by department"
            open={departmentPickerOpen}
            onOpenChange={(open) => {
              setDepartmentPickerOpen(open);
              if (open) {
                setStatusPickerOpen(false);
              }
            }}
            onApply={(value) => setDepartmentFilter(value as LicenseKeyCatalogDepartmentFilter)}
            triggerClassName="license-key-catalog__filter-trigger"
          />
        </div>

        <div className="license-key-catalog__date-filter">
          <ModernDatePicker
            value={dateRange}
            onChange={setDateRange}
            ariaLabel="Filter by generated date"
          />
        </div>

        <div className="license-key-catalog__status-filter">
          <span className="license-key-catalog__status-label">Status:</span>
          <div className="license-key-catalog__filter-container license-key-catalog__filter-container--status">
            <FilterPickerDropdown
              title="Select Status"
              options={LICENSE_KEY_CATALOG_STATUS_OPTIONS}
              value={statusFilter}
              triggerLabel={statusLabel}
              ariaLabel="Filter by status"
              open={statusPickerOpen}
              onOpenChange={(open) => {
                setStatusPickerOpen(open);
                if (open) {
                  setDepartmentPickerOpen(false);
                }
              }}
              onApply={setStatusFilter}
              triggerClassName="license-key-catalog__filter-trigger"
            />
          </div>
        </div>
      </div>

      <div className="license-key-catalog__card">
        <div className="license-key-catalog__table-toolbar">
          <h2 className="license-key-catalog__table-title">Generated Key List</h2>
        </div>

        <div className="license-key-catalog__table-wrap">
          <table className="license-key-catalog__table">
            <thead>
              <tr>
                <th>Serial Key</th>
                <th>User</th>
                <th>Generated Date</th>
                <th>Status</th>
                <th>Expiration Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="license-key-catalog__empty">
                    No keys match your filters
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="license-key-catalog__serial-key">{row.serialKey}</span>
                    </td>
                    <td>{row.username}</td>
                    <td>{row.generatedDate}</td>
                    <td>
                      <span
                        className={`license-key-catalog__status${
                          row.status === "unused" ? " license-key-catalog__status--unused" : ""
                        }`}
                      >
                        {row.status === "used" ? "Used" : "Unused"}
                      </span>
                    </td>
                    <td>{row.expirationDate}</td>
                    <td>
                      {row.status === "used" ? (
                        <button
                          type="button"
                          className="license-key-catalog__revoke-btn"
                          onClick={() => openRevokeRequest(row)}
                        >
                          Request to Revoke
                        </button>
                      ) : (
                        <span className="license-key-catalog__no-action">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="license-key-catalog__footer">
          <span className="license-key-catalog__summary">
            {totalEntries === 0
              ? "Showing 0 entries"
              : `Showing ${showingFrom} to ${showingTo} of ${totalEntries.toLocaleString()} entries`}
          </span>

          <div className="license-key-catalog__pagination">
            <button
              type="button"
              className="license-key-catalog__page-btn"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <IconChevronLeft />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="license-key-catalog__page-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  className={`license-key-catalog__page-btn license-key-catalog__page-btn--number${
                    currentPage === pageNumber ? " license-key-catalog__page-btn--active" : ""
                  }`}
                  onClick={() => goToPage(pageNumber)}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                  aria-label={`Page ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              )
            )}
            <button
              type="button"
              className="license-key-catalog__page-btn"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <IconChevronRight />
            </button>
          </div>
        </footer>
      </div>

      <PortalOverlay open={revokeRequestOpen} onClose={closeRevokeRequest}>
        <LicenseKeyRevokeRequestModal
          onCancel={closeRevokeRequest}
          onSubmit={handleRevokeSubmit}
        />
      </PortalOverlay>

      <PortalOverlay open={revokeSubmittedOpen} onClose={closeRevokeSubmitted}>
        <LicenseKeyRevokeRequestSubmittedModal onDone={closeRevokeSubmitted} />
      </PortalOverlay>

      <PortalOverlay
        open={Boolean(exportDetails)}
        onClose={closeExportSuccess}
        className="portal-backdrop--export-success"
      >
        {exportDetails ? (
          <ExportSuccessfulModal
            filename={exportDetails.filename}
            fileSizeLabel={exportDetails.fileSizeLabel}
            hideSaveLocation
            onClose={closeExportSuccess}
          />
        ) : null}
      </PortalOverlay>
    </div>
  );
}
