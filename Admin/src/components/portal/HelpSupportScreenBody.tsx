import { useEffect, useMemo, useState } from "react";
import PortalOverlay from "./PortalOverlay";
import { PortalErrorState } from "./PortalErrorState";
import TroubleshootingConcernReplyModal from "./TroubleshootingConcernReplyModal";
import TroubleshootingReplySentModal from "./TroubleshootingReplySentModal";
import {
  HELP_SUPPORT_CATALOG_REPORTS,
  HELP_SUPPORT_CATALOG_STATS,
  HELP_SUPPORT_COMMON_ISSUES,
  HELP_SUPPORT_FAQ_ITEMS,
  HELP_SUPPORT_TAB_OPTIONS,
  displayHelpSupportReportStatus,
  filterHelpSupportReports,
  getHelpSupportReplyModalContent,
  helpSupportReportStatusClass,
  helpSupportStatusOpensReplyModal,
  type HelpSupportReportRow,
  type HelpSupportTabFilter,
} from "../../data/demoHelpSupportCatalog";
import type { DateRangeValue } from "../ModernDatePicker";
import { userConcernsApi } from "../../api/userConcerns.api";
import { useNotificationStore } from "../../store/notificationStore";
import "../../styles/help-support-screen.css";
import "../../styles/help-support-troubleshooting-concern-modal.css";
import "../../styles/help-support-reply-sent-modal.css";

type Props = {
  searchQuery: string;
  dateRange: DateRangeValue;
  rows?: HelpSupportReportRow[];
  stats?: {
    total: number;
    totalHint: string;
    resolved: number;
    resolvedHint: string;
    open: number;
    openHint: string;
  };
  faqItems?: typeof HELP_SUPPORT_FAQ_ITEMS;
  commonIssues?: typeof HELP_SUPPORT_COMMON_ISSUES;
};

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

export default function HelpSupportScreenBody({
  searchQuery,
  dateRange,
  rows: rowsProp,
  stats: statsProp,
  faqItems,
  commonIssues,
}: Props) {
  const [tabFilter, setTabFilter] = useState<HelpSupportTabFilter>("all");
  const [rows, setRows] = useState<HelpSupportReportRow[]>(() => [
    ...(rowsProp ?? HELP_SUPPORT_CATALOG_REPORTS),
  ]);
  const [selectedRow, setSelectedRow] = useState<HelpSupportReportRow | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replySentOpen, setReplySentOpen] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const push = useNotificationStore((state) => state.push);

  const helpStats = statsProp ?? HELP_SUPPORT_CATALOG_STATS;
  const faqList = faqItems ?? HELP_SUPPORT_FAQ_ITEMS;
  const issueList = commonIssues ?? HELP_SUPPORT_COMMON_ISSUES;

  useEffect(() => {
    if (rowsProp) {
      setRows([...rowsProp]);
    }
  }, [rowsProp]);

  const filteredRows = useMemo(
    () => filterHelpSupportReports(rows, searchQuery, tabFilter, dateRange),
    [rows, searchQuery, tabFilter, dateRange],
  );

  const totalEntries = filteredRows.length;
  const showingFrom = totalEntries === 0 ? 0 : 1;
  const showingTo = totalEntries;

  const openReplyModal = (row: HelpSupportReportRow) => {
    setReplySentOpen(false);
    setSelectedRow(row);
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedRow(null);
  };

  const handleSendReply = (replyMessage: string) => {
    if (!selectedRow || !replyMessage.trim()) return;

    void (async () => {
      try {
        setReplySubmitting(true);
        await userConcernsApi.updateStatus(Number(selectedRow.id), "resolved", replyMessage.trim());
        setRows((currentRows) =>
          currentRows.map((row) =>
            row.id === selectedRow.id ? { ...row, status: "resolved" } : row,
          ),
        );
        setReplyModalOpen(false);
        setSelectedRow(null);
        setReplySentOpen(true);
      } catch {
        push("Failed to send reply", "error");
      } finally {
        setReplySubmitting(false);
      }
    })();
  };

  const closeReplySent = () => {
    setReplySentOpen(false);
  };

  const replyModalContent = selectedRow ? getHelpSupportReplyModalContent(selectedRow) : null;

  return (
    <div className="admin-shell__content help-support-screen">
      <div className="help-support-screen__stats">
        <div className="help-support-screen__stat help-support-screen__stat--total">
          <div className="help-support-screen__stat-label">Total Support Requests</div>
          <div className="help-support-screen__stat-value">{helpStats.total}</div>
          <p className="help-support-screen__stat-hint">{helpStats.totalHint}</p>
        </div>

        <div className="help-support-screen__stat help-support-screen__stat--resolved">
          <div className="help-support-screen__stat-label">Resolved Issues</div>
          <div className="help-support-screen__stat-value">{helpStats.resolved}</div>
          <p className="help-support-screen__stat-hint">{helpStats.resolvedHint}</p>
        </div>

        <div className="help-support-screen__stat help-support-screen__stat--open">
          <div className="help-support-screen__stat-label">Open Tickets</div>
          <div className="help-support-screen__stat-value">{helpStats.open}</div>
          <p className="help-support-screen__stat-hint">{helpStats.openHint}</p>
        </div>
      </div>

      <div className="help-support-screen__layout">
        <section className="help-support-screen__main-panel" aria-label="Support requests">
          <div className="help-support-screen__tabs" role="tablist" aria-label="Filter by status">
            {HELP_SUPPORT_TAB_OPTIONS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={tabFilter === tab.value}
                className={`help-support-screen__tab${tabFilter === tab.value ? " help-support-screen__tab--active" : ""}`}
                onClick={() => setTabFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="help-support-screen__table-wrap">
            <table className="help-support-screen__table">
              <thead>
                <tr>
                  <th>Serial Key</th>
                  <th>Department</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <PortalErrorState
                        variant="empty"
                        title="No Reports Found"
                        message="No help reports match your search or filters."
                        compact
                        centered
                        className="portal-error-state--table-cell"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="help-support-screen__row help-support-screen__row--clickable"
                      onClick={() => openReplyModal(row)}
                    >
                      <td>
                        <div className="help-support-screen__serial">
                          <span className="help-support-screen__serial-id">{row.id}</span>
                          <span className="help-support-screen__serial-handle">{row.handle}</span>
                        </div>
                      </td>
                      <td>
                        <div className="help-support-screen__org">
                          <span className="help-support-screen__org-name">{row.department}</span>
                          {row.organization ? (
                            <span className="help-support-screen__org-dept">{row.organization}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="help-support-screen__subject">{row.subject}</td>
                      <td>{row.category}</td>
                      <td>
                        <div className="help-support-screen__date">
                          <span className="help-support-screen__date-line">{row.dateLine}</span>
                          <span className="help-support-screen__date-time">{row.timeLine}</span>
                        </div>
                      </td>
                      <td>
                        {helpSupportStatusOpensReplyModal(row.status) ? (
                          <button
                            type="button"
                            className={`help-support-screen__status help-support-screen__status--${helpSupportReportStatusClass(row.status)} help-support-screen__status--clickable`}
                            onClick={(event) => {
                              event.stopPropagation();
                              openReplyModal(row);
                            }}
                          >
                            {displayHelpSupportReportStatus(row.status)}
                          </button>
                        ) : (
                          <span
                            className={`help-support-screen__status help-support-screen__status--${helpSupportReportStatusClass(row.status)}`}
                          >
                            {displayHelpSupportReportStatus(row.status)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="help-support-screen__footer">
            <span className="help-support-screen__summary">
              {totalEntries === 0
                ? "Showing 0 entries"
                : `Showing ${showingFrom} to ${showingTo} of ${totalEntries} entries`}
            </span>
            <div className="help-support-screen__pagination">
              <button type="button" className="help-support-screen__page-btn" disabled aria-label="Previous page">
                <IconChevronLeft />
              </button>
              <button
                type="button"
                className="help-support-screen__page-btn help-support-screen__page-btn--active"
                aria-current="page"
                aria-label="Page 1"
              >
                1
              </button>
              <button type="button" className="help-support-screen__page-btn" disabled aria-label="Next page">
                <IconChevronRight />
              </button>
            </div>
          </div>
        </section>

        <aside className="help-support-screen__side-panel" aria-label="Help resources">
          <section className="help-support-screen__widget">
            <h2 className="help-support-screen__widget-title">Most Common Issues</h2>
            <ul className="help-support-screen__issue-list">
              {issueList.map((issue) => (
                <li key={issue.label} className="help-support-screen__issue-item">
                  <span className="help-support-screen__issue-label">{issue.label}</span>
                  <span className="help-support-screen__issue-count">{issue.count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="help-support-screen__widget">
            <h2 className="help-support-screen__widget-title">FAQs &amp; troubleshooting</h2>
            <ul className="help-support-screen__faq-list">
              {faqList.map((item) => (
                <li key={item.question}>
                  <button type="button" className="help-support-screen__faq-link">
                    {item.question}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <PortalOverlay
        open={replyModalOpen}
        onClose={closeReplyModal}
        className="portal-backdrop--troubleshooting-concern"
      >
        {replyModalOpen && replyModalContent ? (
          <TroubleshootingConcernReplyModal
            key={selectedRow?.id ?? "reply-modal"}
            title={replyModalContent.title}
            statusLabel={replyModalContent.statusLabel}
            details={replyModalContent.details}
            submitting={replySubmitting}
            onClose={closeReplyModal}
            onSendReply={handleSendReply}
          />
        ) : null}
      </PortalOverlay>

      <PortalOverlay open={replySentOpen} onClose={closeReplySent} className="portal-backdrop--reply-sent">
        {replySentOpen ? <TroubleshootingReplySentModal onBack={closeReplySent} /> : null}
      </PortalOverlay>
    </div>
  );
}
