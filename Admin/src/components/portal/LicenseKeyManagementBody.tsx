import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { AdminUser, SerialKey } from "../../types";
import FilterPickerDropdown from "./FilterPickerDropdown";
import {
  displayKeyStatus,
  keyStatusPillClass,
  type KeyActivityItem,
} from "../../data/demoKeys";
import { activityLogsApi } from "../../api/activityLogs.api";
import { mapActivityLogsToKeyActivity } from "../../lib/activityDisplay";
import {
  exportKeysListCsv,
  filterKeyExportRowsByDateRange,
  serialKeysToExportRows,
  type KeyExportOptions,
} from "../../data/exportKeysList";
import { filterKeysByStatus, type KeyStatusFilter } from "../../data/filterKeysList";
import { getEllipsisDirection, getPaginationJumpTarget, renderPaginationEllipsis } from "../../utils/paginationDisplay";
import AnimatedPanel from "../AnimatedPanel";
import PortalOverlay from "./PortalOverlay";
import FigmaModal from "./FigmaModal";
import GenerateLicenseKeysModal from "./GenerateLicenseKeysModal";
import ViewLicenseModal from "./ViewLicenseModal";
import DeactivateKeyModal from "./DeactivateKeyModal";
import RevokeKeyModal from "./RevokeKeyModal";
import ExportLicenseDataModal from "./ExportLicenseDataModal";
import { useNotificationStore } from "../../store/notificationStore";
import { IconExportUsers, IconKeyGen } from "../icons/AdminIcons";
import { PORTAL } from "../../routes/portalPaths";
import "../../styles/portal-pages.css";
import "../../styles/license-key-management.css";
import "../../styles/view-license-modal.css";
import "../../styles/deactivate-key-modal.css";
import "../../styles/revoke-key-modal.css";
import "../../styles/export-license-data-modal.css";
import "../../styles/generate-license-keys-modal.css";
import "../../styles/filter-picker-modal.css";

const PAGE_SIZE = 3;
const FIGMA_ACTIVITY_LOGS = "/admin-dashboard-activity-logs";

type FigmaModalType = "generate" | "view" | "deactivate" | "revoke" | null;

type Row = {
  id: string | number;
  key: string;
  user: string;
  status: string;
  date: string;
  raw?: SerialKey;
};

type GenerateForm = {
  count: string;
  licenseType: string;
  expiration: string;
};

type Props = {
  variant?: "figma" | "portal";
  keys?: SerialKey[];
  users?: AdminUser[];
  onGenerate?: () => void;
  onExportReport?: (options: KeyExportOptions) => void | Promise<void>;
  onView?: (key: SerialKey) => void;
  onDeactivate?: (key: SerialKey) => void;
  onRevoke?: (key: SerialKey) => void;
};

const DEFAULT_FORM: GenerateForm = {
  count: "1",
  licenseType: "enterprise",
  expiration: "12-months",
};

const STATUS_FILTER_OPTIONS: { value: KeyStatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "assigned", label: "Assigned" },
  { value: "active", label: "Active" },
  { value: "available", label: "Available" },
  { value: "revoked", label: "Revoked" },
];

function formatRows(keys?: SerialKey[], users?: AdminUser[]): Row[] {
  if (!keys?.length) {
    return [];
  }

  const userMap = new Map(users?.map((user) => [user.userId, user]) ?? []);

  return keys.map((key) => {
    const assignee = key.assignedTo ? userMap.get(key.assignedTo) : undefined;
    const name = assignee ? `${assignee.firstName ?? ""} ${assignee.lastName ?? ""}`.trim() || assignee.username : "—";

    return {
      id: key.serialId,
      key: key.serialKey,
      user: name,
      status: key.status,
      date: key.generatedAt ? new Date(key.generatedAt).toLocaleDateString() : "—",
      raw: key,
    };
  });
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

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.25H13.5M4.75 8H11.25M6.75 11.75H9.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconHistory({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 4.5V9L12 11.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 9C4.5 12.3137 7.18629 15 10.5 15C13.8137 15 16.5 12.3137 16.5 9C16.5 5.68629 13.8137 3 10.5 3C8.77609 3 7.22109 3.79018 6.15901 5.0625"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path d="M3.75 3.75V6H6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGavel({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4.5 13.5L6.75 11.25M11.25 6.75L13.5 4.5M12.375 3.375L14.625 5.625L12.75 7.5L10.5 5.25L12.375 3.375ZM5.25 10.5L7.5 12.75L5.625 14.625L3.375 12.375L5.25 10.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 15H15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function TimelineIcon({ type }: { type: "generated" | "assigned" | "revoked" | "audit" }) {
  if (type === "generated") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "assigned") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.35" />
        <path
          d="M3.75 13.25C4.35 10.95 5.95 9.75 8 9.75C10.05 9.75 11.65 10.95 12.25 13.25"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "revoked") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.35" />
        <path d="M4.75 4.75L11.25 11.25" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.75 8C2.75 5.10051 5.10051 2.75 8 2.75C10.8995 2.75 13.25 5.10051 13.25 8C13.25 10.8995 10.8995 13.25 8 13.25C5.10051 13.25 2.75 10.8995 2.75 8Z"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function LicenseKeyManagementBody({
  variant = "figma",
  keys,
  users,
  onGenerate,
  onExportReport,
  onView,
  onDeactivate,
  onRevoke,
}: Props) {
  const push = useNotificationStore((s) => s.push);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<KeyStatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [form, setForm] = useState<GenerateForm>(DEFAULT_FORM);
  const [figmaModal, setFigmaModal] = useState<FigmaModalType>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [pageChanging, setPageChanging] = useState(false);
  const [recentActivity, setRecentActivity] = useState<KeyActivityItem[]>([]);

  const rows = formatRows(keys, users);
  const activityLogsHref = variant === "portal" ? PORTAL.activityLogs : FIGMA_ACTIVITY_LOGS;

  useEffect(() => {
    if (variant !== "portal") return;

    activityLogsApi
      .list()
      .then((logs) => setRecentActivity(mapActivityLogsToKeyActivity(logs)))
      .catch(() => setRecentActivity([]));
  }, [variant, keys]);

  const stats = useMemo(() => {
    const list = keys ?? [];
    const assigned = list.filter((key) => key.status === "assigned" || key.status === "used").length;
    const revoked = list.filter((key) => key.status === "revoked" || key.status === "deactivated").length;
    const available = list.filter((key) => key.status === "unused").length;
    const active = list.filter((key) => key.status !== "revoked" && key.status !== "deactivated").length;
    const total = list.length;

    return {
      total,
      active,
      assigned,
      available,
      revoked,
      utilization: total > 0 ? Math.round((assigned / total) * 100) : 0,
    };
  }, [keys]);

  const filteredRows = useMemo(() => filterKeysByStatus(rows, statusFilter), [rows, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageNumbers = paginationItems(currentPage, totalPages);
  const activeFilterLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "Filter Status";

  const goToPage = (nextPage: number) => {
    if (nextPage === currentPage) return;
    setPageChanging(true);
    window.setTimeout(() => {
      setPage(nextPage);
      setPageChanging(false);
    }, 120);
  };

  const handlePaginationJump = (direction: "forward" | "backward") => {
    goToPage(getPaginationJumpTarget(currentPage, totalPages, direction));
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const getExportRows = () => {
    if (keys?.length) {
      const userMap = new Map(users?.map((user) => [user.userId, user]) ?? []);
      return serialKeysToExportRows(keys, userMap);
    }

    return filteredRows;
  };

  const handleExportReport = async (options: KeyExportOptions) => {
    if (exporting) return;

    setExporting(true);
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });

    try {
      if (onExportReport) {
        await onExportReport(options);
      } else {
        const rows = filterKeyExportRowsByDateRange(getExportRows(), options.startDate, options.endDate);
        if (rows.length === 0) {
          push("No keys match the selected criteria", "error");
          return;
        }

        await exportKeysListCsv(rows, options);
        push("Key inventory exported to CSV", "success");
      }

      setExportOpen(false);
    } catch {
      push("Export failed", "error");
    } finally {
      window.setTimeout(() => setExporting(false), 400);
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
  };

  const openFigmaRowModal = (row: Row, type: Exclude<FigmaModalType, null | "generate">) => {
    setSelectedRow(row);
    setFigmaModal(type);
  };

  const closeFigmaModal = () => {
    setFigmaModal(null);
    setSelectedRow(null);
  };

  const renderGenerateButton = () => {
    if (variant === "portal") {
      return (
        <button type="button" className="figma-btn figma-btn--primary figma-btn--block" onClick={onGenerate}>
          Generate Keys
        </button>
      );
    }

  return (
      <button
        type="button"
        className="figma-btn figma-btn--primary figma-btn--block"
        onClick={() => setFigmaModal("generate")}
      >
              Generate Keys
            </button>
    );
  };

  const renderViewAction = (row: Row) => {
    if (row.raw && onView) {
      return (
        <button type="button" className="key-mgmt-table__action" onClick={() => onView(row.raw!)}>
          View
        </button>
      );
    }

    if (variant === "figma") {
      return (
        <button type="button" className="key-mgmt-table__action" onClick={() => openFigmaRowModal(row, "view")}>
          View
        </button>
      );
    }

    return null;
  };

  const renderDeactivateAction = (row: Row) => {
    if (row.raw && onDeactivate) {
      return (
        <button type="button" className="key-mgmt-table__action key-mgmt-table__action--muted" onClick={() => onDeactivate(row.raw!)}>
          Deactivate
        </button>
      );
    }

    if (variant === "figma") {
      return (
        <button
          type="button"
          className="key-mgmt-table__action key-mgmt-table__action--muted"
          onClick={() => openFigmaRowModal(row, "deactivate")}
        >
          Deactivate
        </button>
      );
    }

    return null;
  };

  const renderRevokeAction = (row: Row) => {
    if (row.raw && onRevoke) {
      return (
        <button type="button" className="key-mgmt-table__action key-mgmt-table__action--danger" onClick={() => onRevoke(row.raw!)}>
          Revoke
        </button>
      );
    }

    if (variant === "figma") {
      return (
        <button
          type="button"
          className="key-mgmt-table__action key-mgmt-table__action--danger"
          onClick={() => openFigmaRowModal(row, "revoke")}
        >
          Revoke
          </button>
      );
    }

    return null;
  };

  return (
    <div className="admin-shell__content key-mgmt">
      <div className="key-mgmt-stats">
        <div className="dash-stat">
          <div className="dash-stat__label">Total Keys</div>
          <div className="dash-stat__value">{stats.total.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Active Keys</div>
          <div className="dash-stat__value">{stats.active.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Assigned Keys</div>
          <div className="dash-stat__value">{stats.assigned.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Available Keys</div>
          <div className="dash-stat__value">{stats.available.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Revoked Keys</div>
          <div className="dash-stat__value">{stats.revoked.toLocaleString()}</div>
        </div>
      </div>

      <div className="key-mgmt-layout">
        <div className="key-mgmt-main">
          <div className="portal-table-card key-mgmt-table-card">
          <div className="portal-table-card__header">
            <span className="portal-table-card__title">Key Inventory</span>
              <div className="key-mgmt-table-card__actions">
                <div className="key-mgmt-filter-wrap">
                  <FilterPickerDropdown
                    title="Select Status"
                    options={STATUS_FILTER_OPTIONS}
                    value={statusFilter}
                    triggerLabel={activeFilterLabel}
                    ariaLabel="Filter keys by status"
                    open={filterOpen}
                    onOpenChange={setFilterOpen}
                    onApply={setStatusFilter}
                    triggerClassName="key-mgmt-filter-btn"
                    triggerPrefix={<IconFilter className="key-mgmt-filter-btn__icon" />}
                    showChevron={false}
                    dropdownAlign="right"
                  />
                </div>
                <button
                  type="button"
                  className={`key-mgmt-export-btn${exporting ? " key-mgmt-action-btn--loading" : ""}`}
                  onClick={() => setExportOpen(true)}
                  disabled={exporting}
                  aria-busy={exporting}
                >
                  <IconExportUsers
                    className={`key-mgmt-export-btn__icon${exporting ? " key-mgmt-action-icon--spinning" : ""}`}
                  />
                  {exporting ? "Exporting..." : "Export CSV"}
                </button>
              </div>
          </div>

            <AnimatedPanel
              transitionKey={`${currentPage}-${statusFilter}-${pageChanging ? "loading" : "ready"}`}
              className={`key-mgmt-table-panel${pageChanging ? " page-transition--loading" : ""}`}
            >
            <table className="portal-table key-mgmt-table">
            <thead>
                <tr>
                  <th>Key ID</th>
                  <th>Serial Key</th>
                  <th>Assigned User</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="portal-table-empty">
                      No keys match your filter
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td className="key-mgmt-table__key">{row.key}</td>
                      <td>{row.user}</td>
                      <td>
                        <span className={`portal-pill portal-pill--${keyStatusPillClass(row.status)}`}>
                          {displayKeyStatus(row.status)}
                        </span>
                      </td>
                      <td>{row.date}</td>
                      <td>
                        <div className="key-mgmt-table__actions">
                          {renderViewAction(row)}
                          {renderDeactivateAction(row)}
                          {renderRevokeAction(row)}
                        </div>
                  </td>
                </tr>
                  ))
                )}
            </tbody>
          </table>
            </AnimatedPanel>

            <div className="key-mgmt-table-footer">
              <span className="key-mgmt-table-footer__summary">
                Page {currentPage} of {totalPages}
              </span>
              <div className="key-mgmt-pagination">
                <button
                  type="button"
                  className="key-mgmt-pagination__arrow"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  aria-label="Previous page"
                >
                  <IconChevronLeft />
                </button>
                {pageNumbers.map((pageNumber, index) =>
                  pageNumber === "ellipsis" ? (
                    renderPaginationEllipsis(
                      `ellipsis-${index}`,
                      getEllipsisDirection(pageNumbers, index),
                      handlePaginationJump,
                      "key-mgmt-pagination__ellipsis"
                    )
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`key-mgmt-pagination__page${currentPage === pageNumber ? " key-mgmt-pagination__page--active" : ""}`}
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
                  className="key-mgmt-pagination__arrow"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  aria-label="Next page"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="key-mgmt-sidebar">
          <section className="key-mgmt-side-card">
            <div className="key-mgmt-side-card__title-row">
              <h2 className="key-mgmt-side-card__title">
                <IconKeyGen className="key-mgmt-side-card__title-icon" />
                Generate Keys
              </h2>
            </div>

            <div className="key-mgmt-form-field">
              <label className="key-mgmt-form-field__label" htmlFor="key-count">
                Number of Keys
              </label>
              <input
                id="key-count"
                className="key-mgmt-form-field__input"
                type="number"
                min="1"
                value={form.count}
                onChange={(event) => setForm((current) => ({ ...current, count: event.target.value }))}
              />
            </div>

            <div className="key-mgmt-form-field">
              <label className="key-mgmt-form-field__label" htmlFor="license-type">
                Serial Type
              </label>
              <select
                id="license-type"
                className="key-mgmt-form-field__select"
                value={form.licenseType}
                onChange={(event) => setForm((current) => ({ ...current, licenseType: event.target.value }))}
              >
                <option value="enterprise">Enterprise (Multi-Device)</option>
                <option value="standard">Standard (Single Device)</option>
              </select>
            </div>

            <div className="key-mgmt-form-field">
              <label className="key-mgmt-form-field__label" htmlFor="expiration-period">
                Expiration Period
              </label>
              <select
                id="expiration-period"
                className="key-mgmt-form-field__select"
                value={form.expiration}
                onChange={(event) => setForm((current) => ({ ...current, expiration: event.target.value }))}
              >
                <option value="12-months">12 Months (Standard)</option>
                <option value="24-months">24 Months</option>
                <option value="36-months">36 Months</option>
              </select>
            </div>

            <div className="key-mgmt-form-actions">
              {renderGenerateButton()}
              <div className="key-mgmt-form-actions__secondary">
                <button type="button" className="key-mgmt-form-link" onClick={resetForm}>
                  Reset Form
                </button>
                <button type="button" className="key-mgmt-form-link key-mgmt-form-link--danger" onClick={resetForm}>
                  Cancel
              </button>
              </div>
            </div>
          </section>

          <section className="key-mgmt-side-card">
            <div className="key-mgmt-side-card__title-row">
              <h2 className="key-mgmt-side-card__title">Recent Activity</h2>
              <IconHistory className="key-mgmt-side-card__history-icon" />
          </div>

            <div className="key-mgmt-timeline">
              {recentActivity.length === 0 ? (
                <p className="key-mgmt-timeline__empty">No recent key activity yet.</p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="key-mgmt-timeline__item">
                    <span className={`key-mgmt-timeline__icon key-mgmt-timeline__icon--${item.type}`}>
                      <TimelineIcon type={item.type} />
                    </span>
                    <div className="key-mgmt-timeline__body">
                      <div className="key-mgmt-timeline__label">{item.label}</div>
                      <div className="key-mgmt-timeline__time">{item.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link to={activityLogsHref} className="key-mgmt-view-all">
              View All Activity
            </Link>
          </section>

          <section className="key-mgmt-side-card key-mgmt-utilization">
            <div className="key-mgmt-utilization__head">
              <span className="key-mgmt-utilization__label">Serial Utilization</span>
              <span className="key-mgmt-utilization__value">{stats.utilization}%</span>
            </div>
            <div className="key-mgmt-utilization__bar">
              <div className="key-mgmt-utilization__fill" style={{ width: `${stats.utilization}%` }} />
            </div>
          </section>

          <section className="key-mgmt-side-card">
            <button
              type="button"
              className="key-mgmt-rules"
              onClick={() => setRulesOpen((open) => !open)}
              aria-expanded={rulesOpen}
            >
              <IconGavel className="key-mgmt-rules__icon" />
              <span className="key-mgmt-rules__label">Licensing Rules</span>
              <svg
                className={`key-mgmt-rules__chevron${rulesOpen ? " key-mgmt-rules__chevron--open" : ""}`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {rulesOpen ? (
              <div className="key-mgmt-rules__panel">
                <p>Enterprise keys support up to 5 concurrent device activations per serial.</p>
                <p>Revoked keys cannot be reassigned and must be replaced with a newly generated key.</p>
                <p>Standard serials expire automatically after the selected expiration period.</p>
              </div>
            ) : null}
          </section>
        </aside>
      </div>

      {variant === "figma" ? (
        <>
          <PortalOverlay open={figmaModal === "generate"} onClose={closeFigmaModal}>
            <GenerateLicenseKeysModal
              onClose={closeFigmaModal}
              onConfirm={() => {
                push("Serial key generated", "success");
                closeFigmaModal();
              }}
            />
          </PortalOverlay>

          <PortalOverlay open={figmaModal === "view"} onClose={closeFigmaModal}>
            <ViewLicenseModal row={selectedRow} onClose={closeFigmaModal} />
          </PortalOverlay>

          <PortalOverlay open={figmaModal === "deactivate"} onClose={closeFigmaModal}>
            <DeactivateKeyModal
              row={selectedRow}
              onClose={closeFigmaModal}
              onConfirm={() => {
                push("Key deactivated", "success");
                closeFigmaModal();
              }}
            />
          </PortalOverlay>

          <PortalOverlay open={figmaModal === "revoke"} onClose={closeFigmaModal}>
            <RevokeKeyModal
              row={selectedRow}
              onClose={closeFigmaModal}
              onConfirm={() => {
                push("Key revoked", "success");
                closeFigmaModal();
              }}
            />
          </PortalOverlay>
        </>
      ) : null}

      <PortalOverlay open={exportOpen} onClose={() => !exporting && setExportOpen(false)}>
        <ExportLicenseDataModal
          onClose={() => setExportOpen(false)}
          onExport={handleExportReport}
          exporting={exporting}
        />
      </PortalOverlay>
    </div>
  );
}
