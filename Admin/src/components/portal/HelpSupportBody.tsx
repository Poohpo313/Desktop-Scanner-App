import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PortalOverlay from "./PortalOverlay";
import ProvideAssistanceModal from "./ProvideAssistanceModal";
import FilterPickerDropdown from "./FilterPickerDropdown";
import { IconExportUsers } from "../icons/AdminIcons";
import { useNotificationStore } from "../../store/notificationStore";
import { downloadCsvInBrowser } from "../../utils/downloadCsv";
import {
  DEMO_SUPPORT_TICKETS,
  FIGMA_SUPPORT_STATS,
  FIGMA_SUPPORT_TOTAL,
  displayTicketStatus,
  ticketStatusPillClass,
  type SupportTicketRow,
} from "../../data/demoSupportTickets";
import "../../styles/portal-pages.css";
import "../../styles/help-support-center.css";
import "../../styles/provide-assistance-modal.css";
import "../../styles/filter-picker-modal.css";

const PAGE_SIZE = 6;

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Filter" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "urgent", label: "Urgent" },
  { value: "resolved", label: "Resolved" },
] as const;

type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number]["value"];

type SupportStats = {
  openTickets: number;
  resolvedToday: number;
  pendingResponse: number;
  averageResolution: string;
  total: number;
};

type Props = {
  variant?: "figma" | "portal";
  tickets?: SupportTicketRow[];
  stats?: SupportStats;
  totalTickets?: number;
};

function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.25H13.5M4.75 8H11.25M6.75 11.75H9.25"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconHeadset({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.25 7.25V6.25C3.25 4.15 4.85 2.75 7 2.75C9.15 2.75 10.75 4.15 10.75 6.25V7.25"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <rect x="2.25" y="7" width="2.25" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.15" />
      <rect x="9.5" y="7" width="2.25" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.15" />
      <path d="M4.5 10.5H9.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M9 3.5L5.5 7L9 10.5" : "M5.5 3.5L9 7L5.5 10.5"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderUserCell(row: SupportTicketRow) {
  return (
    <div className="help-support-table__user">
      {row.avatarUrl ? (
        <img className="help-support-table__avatar" src={row.avatarUrl} alt="" />
      ) : (
        <span className="help-support-table__avatar-initials" aria-hidden="true">
          {row.initials ?? row.userName.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="help-support-table__user-name">{row.userName}</span>
    </div>
  );
}

function renderAssistButton(onClick: () => void) {
  return (
    <button type="button" className="help-support__assist-btn" onClick={onClick}>
      Assist
      <IconHeadset className="help-support__assist-icon" />
    </button>
  );
}

export default function HelpSupportBody({
  variant: _variant = "figma",
  tickets = DEMO_SUPPORT_TICKETS,
  stats = FIGMA_SUPPORT_STATS,
  totalTickets = FIGMA_SUPPORT_TOTAL,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [assistanceOpen, setAssistanceOpen] = useState(false);
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    const routeState = location.state as { provideAssistance?: boolean } | null;
    if (routeState?.provideAssistance) {
      setAssistanceOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return tickets;
    return tickets.filter((row) => row.status === statusFilter);
  }, [statusFilter, tickets]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredRows.slice(pageStart, pageStart + PAGE_SIZE);
  const showingFrom = filteredRows.length === 0 ? 0 : pageStart + 1;
  const showingTo = pageStart + pageRows.length;

  const activeFilterLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "Filter";

  const openAssistance = () => setAssistanceOpen(true);

  const handleExport = () => {
    const header = "ID,User,Issue,Status,Date";
    const rows = filteredRows.map(
      (row) =>
        `"${row.id}","${row.userName.replace(/"/g, '""')}","${row.issue.replace(/"/g, '""')}","${row.status}","${row.dateLine}"`
    );
    downloadCsvInBrowser([header, ...rows].join("\n"), "support-tickets.csv", "text/csv");
    push("Support tickets exported", "success");
  };

  return (
    <div className="admin-shell__content help-support">
      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat__label">Open Tickets</div>
          <div className="dash-stat__value">{stats.openTickets}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Resolved Today</div>
          <div className="dash-stat__value">{stats.resolvedToday}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Pending Response</div>
          <div className="dash-stat__value">{stats.pendingResponse}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Average Resolution</div>
          <div className="dash-stat__value">{stats.averageResolution}</div>
        </div>
      </div>

      <div className="portal-table-card help-support-table-card">
        <div className="portal-table-card__header">
          <span className="portal-table-card__title">Support Tickets</span>
          <div className="help-support-table-card__actions">
            <div className="help-support-filter-wrap">
              <FilterPickerDropdown
                title="Select Status"
                options={STATUS_FILTER_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={statusFilter}
                triggerLabel={activeFilterLabel}
                ariaLabel="Filter support tickets by status"
                open={filterOpen}
                onOpenChange={setFilterOpen}
                onApply={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                triggerClassName="help-support-filter-btn"
                triggerPrefix={<IconFilter className="help-support-filter-btn__icon" />}
                showChevron={false}
                dropdownAlign="right"
              />
            </div>
            <button type="button" className="help-support-export-btn" onClick={handleExport}>
              <IconExportUsers className="help-support-export-btn__icon" />
              Export
            </button>
          </div>
        </div>

        <table className="portal-table help-support-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="portal-table-empty">
                  No tickets match your filter
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id}>
                  <td className="help-support-table__id">{row.id}</td>
                  <td>{renderUserCell(row)}</td>
                  <td>{row.issue}</td>
                  <td>
                    <span className={`help-support-pill help-support-pill--${ticketStatusPillClass(row.status)}`}>
                      {displayTicketStatus(row.status)}
                    </span>
                  </td>
                  <td>
                    <div className="help-support-table__date">
                      <span>{row.dateLine}</span>
                      <span className="help-support-table__date-time">{row.timeLine}</span>
                    </div>
                  </td>
                  <td className="help-support-table__actions">{renderAssistButton(openAssistance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="help-support-table-footer">
          <span className="help-support-table-footer__summary">
            {filteredRows.length === 0
              ? `Showing 0 of ${totalTickets} tickets`
              : pageRows.length === filteredRows.length && currentPage === 1
                ? `Showing ${pageRows.length} of ${totalTickets} tickets`
                : showingFrom === showingTo
                  ? `Showing ${showingTo} of ${totalTickets} tickets`
                  : `Showing ${showingFrom}-${showingTo} of ${totalTickets} tickets`}
          </span>
          <div className="help-support-pagination">
            <button
              type="button"
              className="help-support-pagination__arrow"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <IconChevron direction="left" />
            </button>
            <button
              type="button"
              className="help-support-pagination__arrow"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              <IconChevron direction="right" />
            </button>
          </div>
        </div>
      </div>

      <PortalOverlay open={assistanceOpen} onClose={() => setAssistanceOpen(false)}>
        <ProvideAssistanceModal onClose={() => setAssistanceOpen(false)} />
      </PortalOverlay>
    </div>
  );
}
