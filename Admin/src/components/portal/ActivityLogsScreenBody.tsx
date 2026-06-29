import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import ModernDatePicker, { EMPTY_DATE_RANGE, type DateRangeValue } from "../ModernDatePicker";
import FilterPickerDropdown from "./FilterPickerDropdown";
import PortalOverlay from "./PortalOverlay";
import ExportSuccessfulModal from "./ExportSuccessfulModal";
import { useNotificationStore } from "../../store/notificationStore";
import {
  ACTIVITY_LOGS_PAGE_SIZE,
  ACTIVITY_LOG_STATUS_OPTIONS,
  activityLogStatusLabel,
  areActivityLogRowsEqual,
  exportActivityLogsViewCsv,
  fetchActivityLogsView,
  filterActivityLogsView,
  type ActivityLogsViewExportResult,
  type ActivityLogStatusFilter,
  type ActivityLogViewRow,
  type ActivityLogViewStatus,
} from "../../data/demoActivityLogsView";
import "../../styles/portal-modal.css";
import "../../styles/activity-logs-screen.css";
import "../../styles/filter-picker-modal.css";
import "../../styles/export-successful-modal.css";

type Props = {
  variant?: "figma" | "portal";
};

function paginationWindow(current: number, total: number): number[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (current >= total - 2) {
    return [total - 4, total - 3, total - 2, total - 1, total];
  }

  return [current - 2, current - 1, current, current + 1, current + 2];
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

function IconGenericUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6.25" r="2.5" fill="currentColor" />
      <path
        d="M4.25 15.25C5.2 12.35 6.85 11 9 11C11.15 11 12.8 12.35 13.75 15.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: ActivityLogViewStatus }) {
  return (
    <span className={`activity-logs-view__status activity-logs-view__status--${status}`}>
      {activityLogStatusLabel(status)}
    </span>
  );
}

function UserAvatar({ row }: { row: ActivityLogViewRow }) {
  if (row.avatarKind === "photo" && row.avatar) {
    return <img src={row.avatar} alt="" className="activity-logs-view__avatar activity-logs-view__avatar--photo" />;
  }

  if (row.avatarKind === "generic") {
    return (
      <span className="activity-logs-view__avatar activity-logs-view__avatar--generic" aria-hidden="true">
        <IconGenericUser />
      </span>
    );
  }

  return (
    <span className="activity-logs-view__avatar activity-logs-view__avatar--initials" aria-hidden="true">
      {row.initials}
    </span>
  );
}

export default function ActivityLogsScreenBody({
  variant = "portal",
}: Props) {
  const push = useNotificationStore((s) => s.push);
  const [rows, setRows] = useState<ActivityLogViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDateRange, setFilterDateRange] = useState<DateRangeValue>(EMPTY_DATE_RANGE);
  const [statusFilter, setStatusFilter] = useState<ActivityLogStatusFilter>("all");
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [exportDetails, setExportDetails] = useState<ActivityLogsViewExportResult | null>(null);

  const loadRows = useCallback(
    async (options?: { notify?: boolean }) => {
      const notify = options?.notify ?? false;
      const nextRows = await fetchActivityLogsView(variant);
      let changed = false;

      setRows((current) => {
        changed = !areActivityLogRowsEqual(current, nextRows);
        return changed ? nextRows : current;
      });

      if (notify) {
        push(
          changed ? "Activity logs refreshed" : "Activity logs are up to date",
          changed ? "success" : "info"
        );
      }

      return changed;
    },
    [push, variant]
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    loadRows()
      .catch(() => {
        if (!cancelled) {
          push("Failed to load activity logs", "error");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadRows, push]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterDateRange, statusFilter]);

  const filteredRows = useMemo(
    () => filterActivityLogsView(rows, searchQuery, statusFilter, filterDateRange),
    [rows, searchQuery, statusFilter, filterDateRange]
  );

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / ACTIVITY_LOGS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * ACTIVITY_LOGS_PAGE_SIZE;
  const pageRows = filteredRows.slice(pageStart, pageStart + ACTIVITY_LOGS_PAGE_SIZE);
  const showingFrom = totalEntries === 0 ? 0 : pageStart + 1;
  const showingTo = pageStart + pageRows.length;
  const pageNumbers = paginationWindow(currentPage, totalPages);

  const activeStatusLabel =
    ACTIVITY_LOG_STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "All";

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const handleRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);
    loadRows({ notify: true })
      .catch(() => push("Failed to refresh activity logs", "error"))
      .finally(() => window.setTimeout(() => setRefreshing(false), 700));
  };

  const handleExportLogs = async () => {
    try {
      const result = await exportActivityLogsViewCsv(filteredRows);
      setExportDetails(result);
    } catch (error) {
      console.error("Activity logs export failed", error);
      push("Export failed. Please try again.", "error");
    }
  };

  const closeExportSuccess = () => {
    setExportDetails(null);
  };

  return (
    <div className="admin-shell__content activity-logs-screen">
      <div className="activity-logs-screen__card">
      <div className="activity-logs-screen__toolbar">
        <div className="activity-logs-screen__intro">
          <h1 className="activity-logs-screen__title">Activity Logs</h1>
          <p className="activity-logs-screen__subtitle">
            View and monitor all system activities and events.
          </p>
        </div>
        <div className="activity-logs-screen__actions">
          <button
            type="button"
            className="figma-btn figma-btn--primary activity-logs-screen__action-btn"
            onClick={handleExportLogs}
          >
            Export Logs
          </button>
          <button
            type="button"
            className="figma-btn figma-btn--primary activity-logs-screen__action-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="activity-logs-view__filters">
        <label className="activity-logs-view__search">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search user or action..."
            aria-label="Search user or action"
          />
        </label>

        <div className="activity-logs-view__date-filter">
          <ModernDatePicker
            value={filterDateRange}
            onChange={setFilterDateRange}
            ariaLabel="Filter by date range"
          />
        </div>

        <div className="activity-logs-view__status-filter">
          <FilterPickerDropdown
            title="Select Status"
            options={ACTIVITY_LOG_STATUS_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            value={statusFilter}
            triggerLabel={activeStatusLabel}
            ariaLabel="Filter by status"
            open={statusPickerOpen}
            onOpenChange={setStatusPickerOpen}
            onApply={setStatusFilter}
            triggerClassName="activity-logs-view__status-trigger"
          />
        </div>
      </div>

      <div className="activity-logs-view__table-wrap">
        <table className="activity-logs-view__table">
          <colgroup>
            <col className="activity-logs-view__col-user" />
            <col className="activity-logs-view__col-action" />
            <col className="activity-logs-view__col-status" />
            <col className="activity-logs-view__col-time" />
          </colgroup>
          <thead>
            <tr>
              <th>USER</th>
              <th>ACTION</th>
              <th>STATUS</th>
              <th>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="activity-logs-view__empty">
                  Loading activity logs...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="activity-logs-view__empty">
                  No activity logs match your filters
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="activity-logs-view__user">
                      <UserAvatar row={row} />
                      <div className="activity-logs-view__user-text">
                        <span className="activity-logs-view__name">{row.name}</span>
                        <span className="activity-logs-view__email">{row.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="activity-logs-view__action">
                      <span className="activity-logs-view__action-title">{row.actionTitle}</span>
                      <span className="activity-logs-view__action-detail">{row.actionDetail}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="activity-logs-view__timestamp">{row.timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="activity-logs-view__footer">
          <span className="activity-logs-view__summary">
            {totalEntries === 0
              ? "Showing 0 entries"
              : `Showing ${showingFrom} to ${showingTo} of ${totalEntries.toLocaleString()} entries`}
          </span>
          <div className="activity-logs-view__pagination">
            <button
              type="button"
              className="activity-logs-view__page-btn"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <IconChevronLeft />
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`activity-logs-view__page-btn activity-logs-view__page-btn--number${currentPage === pageNumber ? " activity-logs-view__page-btn--active" : ""}`}
                onClick={() => goToPage(pageNumber)}
                aria-current={currentPage === pageNumber ? "page" : undefined}
                aria-label={`Page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="activity-logs-view__page-btn"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>
      </div>

      <PortalOverlay
        open={Boolean(exportDetails)}
        onClose={closeExportSuccess}
        className="portal-backdrop--export-success"
      >
        {exportDetails ? (
          <ExportSuccessfulModal
            filename={exportDetails.filename}
            fileSizeLabel={exportDetails.fileSizeLabel}
            savePath={exportDetails.savePath}
            onClose={closeExportSuccess}
          />
        ) : null}
      </PortalOverlay>
    </div>
  );
}
