import { useCallback, useEffect, useMemo, useState } from "react";
import { keysApi } from "../../api/keys.api";
import { extractApiError } from "../../lib/extractApiError";
import { useNotificationStore } from "../../store/notificationStore";
import { IconSearch } from "../icons/AdminIcons";
import FilterPickerDropdown from "./FilterPickerDropdown";
import PortalOverlay from "./PortalOverlay";
import SettingsRevocationCancelRequestModal from "./SettingsRevocationCancelRequestModal";
import SettingsRevocationCancelRequestSuccessModal from "./SettingsRevocationCancelRequestSuccessModal";
import {
  DEFAULT_SETTINGS_REVOCATIONS_BINS_REQUEST_FILTER,
  SETTINGS_REVOCATIONS_BINS_REQUEST_FILTER_OPTIONS,
  SETTINGS_REVOCATIONS_BINS_REQUEST_PAGE_SIZE,
  displaySettingsRevocationRequestStatus,
  displaySettingsRevocationRequestType,
  filterSettingsRevocationRequests,
  type SettingsRevocationRequestFilter,
  type SettingsRevocationRequestRow,
  type SettingsRevocationRequestType,
} from "../../data/demoSettingsRevocationsBinsRequest";
import "../../styles/filter-picker-modal.css";

function IconFilter() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M1.75 3.5H12.25M3.5 7H10.5M5.75 10.5H8.25"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8.75 3.25L5 7L8.75 10.75"
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
        d="M5.25 3.25L9 7L5.25 10.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function RequestTypeIcon({ type }: { type: SettingsRevocationRequestType }) {
  if (type === "deletion-request") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 4.75H12.5M6.25 4.75V3.75C6.25 3.2 6.7 2.75 7.25 2.75H8.75C9.3 2.75 9.75 3.2 9.75 3.75V4.75M6.25 7.25V11.25M9.75 7.25V11.25M4.75 4.75L5.25 12.75C5.25 13.3 5.7 13.75 6.25 13.75H9.75C10.3 13.75 10.75 13.3 10.75 12.75L11.25 4.75"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.25" cy="6.25" r="3.25" stroke="currentColor" strokeWidth="1.15" />
      <path
        d="M8.75 8.75L12.75 12.75M10.75 4.75H12.75C13.3 4.75 13.75 5.2 13.75 5.75V7.75"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function mapApiRow(row: {
  requestId: number;
  requestType: "key" | "device";
  status: string;
  createdAt: string;
  referenceId: string;
}): SettingsRevocationRequestRow {
  const created = new Date(row.createdAt);
  const requestType: SettingsRevocationRequestType =
    row.requestType === "device" ? "deletion-request" : "key-revocation";
  const status =
    row.status === "approved"
      ? "approved"
      : row.status === "rejected"
        ? "rejected"
        : "pending";

  return {
    id: String(row.requestId),
    requestType,
    referenceId: row.referenceId,
    dateLine: created.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    timeLine: created.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    status,
  };
}

export default function SettingsActivityHistory() {
  const [rows, setRows] = useState<SettingsRevocationRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SettingsRevocationRequestFilter>(
    DEFAULT_SETTINGS_REVOCATIONS_BINS_REQUEST_FILTER,
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelSuccessOpen, setCancelSuccessOpen] = useState(false);
  const [pendingCancelRow, setPendingCancelRow] = useState<SettingsRevocationRequestRow | null>(null);
  const push = useNotificationStore((s) => s.push);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const next = await keysApi.listRevocationRequests();
      setRows(next.map(mapApiRow));
    } catch (error) {
      setRows([]);
      push(extractApiError(error, "Failed to load revocation requests"), "error");
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(
    () => filterSettingsRevocationRequests(rows, searchQuery, statusFilter),
    [rows, searchQuery, statusFilter],
  );

  const filterLabel =
    SETTINGS_REVOCATIONS_BINS_REQUEST_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ??
    "Filter";

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / SETTINGS_REVOCATIONS_BINS_REQUEST_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * SETTINGS_REVOCATIONS_BINS_REQUEST_PAGE_SIZE;
  const pageRows = filteredRows.slice(pageStart, pageStart + SETTINGS_REVOCATIONS_BINS_REQUEST_PAGE_SIZE);
  const showingFrom = pageRows.length === 0 ? 0 : pageStart + 1;
  const showingTo = pageStart + pageRows.length;
  const pageNumbers = paginationItems(currentPage, totalPages);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const openCancelConfirm = (row: SettingsRevocationRequestRow) => {
    setPendingCancelRow(row);
    setCancelSuccessOpen(false);
    setCancelConfirmOpen(true);
  };

  const closeCancelConfirm = () => {
    setCancelConfirmOpen(false);
    setPendingCancelRow(null);
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancelRow) return;

    try {
      await keysApi.cancelRevocationRequest(Number(pendingCancelRow.id));
      setCancelConfirmOpen(false);
      setCancelSuccessOpen(true);
      await loadRows();
    } catch {
      setCancelConfirmOpen(false);
      setPendingCancelRow(null);
    }
  };

  const closeCancelSuccess = () => {
    setCancelSuccessOpen(false);
    setPendingCancelRow(null);
  };

  return (
    <>
      <header className="settings-figma__panel-head">
        <h1 className="settings-figma__panel-title">Revocations and Bins Request</h1>
        <p className="settings-figma__panel-subtitle">
          Review, track, and manage key revocation and deletion requests submitted within your
          assigned department.
        </p>
      </header>

      <div className="settings-figma__revocations-toolbar">
        <label className="settings-figma__revocations-search">
          <IconSearch width={16} height={16} />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search reference ID or type..."
            aria-label="Search reference ID or type"
          />
        </label>
        <FilterPickerDropdown
          title="Filter Requests"
          options={SETTINGS_REVOCATIONS_BINS_REQUEST_FILTER_OPTIONS}
          value={statusFilter}
          triggerLabel={filterLabel === "All" ? "Filter" : filterLabel}
          ariaLabel="Filter requests"
          open={filterOpen}
          onOpenChange={setFilterOpen}
          onApply={setStatusFilter}
          onReset={() => setStatusFilter(DEFAULT_SETTINGS_REVOCATIONS_BINS_REQUEST_FILTER)}
          cancelLabel="Reset"
          applyLabel="Apply Filter"
          showChevron={false}
          dropdownAlign="right"
          triggerClassName="settings-figma__revocations-filter-btn"
          triggerPrefix={<IconFilter />}
        />
      </div>

      <div className="settings-figma__revocations-table-wrap">
        <table className="settings-figma__revocations-table">
          <thead>
            <tr>
              <th scope="col">Request Type & Reason</th>
              <th scope="col">Serial Key</th>
              <th scope="col">Date Submitted</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="settings-figma__revocations-empty">
                  Loading requests...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="settings-figma__revocations-empty">
                  No requests match your search or filter
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="settings-figma__revocations-type">
                      <span
                        className={`settings-figma__revocations-type-icon settings-figma__revocations-type-icon--${row.requestType}`}
                        aria-hidden="true"
                      >
                        <RequestTypeIcon type={row.requestType} />
                      </span>
                      <span>{displaySettingsRevocationRequestType(row.requestType)}</span>
                    </div>
                  </td>
                  <td className="settings-figma__revocations-ref">{row.referenceId}</td>
                  <td>
                    <span className="settings-figma__revocations-datetime">
                      {row.dateLine}
                      <span className="settings-figma__revocations-datetime-sep" aria-hidden="true">
                        {" "}
                        •{" "}
                      </span>
                      {row.timeLine}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`settings-figma__revocations-status settings-figma__revocations-status--${row.status}`}
                    >
                      {displaySettingsRevocationRequestStatus(row.status)}
                    </span>
                  </td>
                  <td>
                    {row.status === "pending" ? (
                      <button
                        type="button"
                        className="settings-figma__revocations-cancel-btn"
                        onClick={() => openCancelConfirm(row)}
                      >
                        Cancel Request
                      </button>
                    ) : (
                      <span className="settings-figma__revocations-no-action">No actions available</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="settings-figma__revocations-footer">
          <span className="settings-figma__revocations-summary">
            {totalEntries === 0
              ? "Showing 0 entries"
              : `Showing ${showingFrom} to ${showingTo} of ${totalEntries} entries`}
          </span>
          <div className="settings-figma__revocations-pagination" aria-label="Revocations and Bins Request pagination">
            <button
              type="button"
              className="settings-figma__revocations-page-btn"
              disabled={currentPage <= 1}
              aria-label="Previous page"
              onClick={() => goToPage(currentPage - 1)}
            >
              <IconChevronLeft />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="settings-figma__revocations-page-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  className={`settings-figma__revocations-page-btn${
                    currentPage === pageNumber ? " settings-figma__revocations-page-btn--active" : ""
                  }`}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                  aria-label={`Page ${pageNumber}`}
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              className="settings-figma__revocations-page-btn"
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              onClick={() => goToPage(currentPage + 1)}
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>

      <PortalOverlay open={cancelConfirmOpen} onClose={closeCancelConfirm}>
        <SettingsRevocationCancelRequestModal onKeep={closeCancelConfirm} onConfirm={() => void handleConfirmCancel()} />
      </PortalOverlay>

      <PortalOverlay open={cancelSuccessOpen && Boolean(pendingCancelRow)} onClose={closeCancelSuccess}>
        {pendingCancelRow ? (
          <SettingsRevocationCancelRequestSuccessModal
            referenceId={pendingCancelRow.referenceId}
            onDone={closeCancelSuccess}
          />
        ) : null}
      </PortalOverlay>
    </>
  );
}
