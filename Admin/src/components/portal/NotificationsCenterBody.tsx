import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconSearch,
} from "../icons/AdminIcons";
import NotificationTypeIcon from "../icons/NotificationTypeIcon";
import DismissAllNotificationsModal from "./DismissAllNotificationsModal";
import CloseNotificationCenterModal from "./CloseNotificationCenterModal";
import NotificationsDismissedModal from "./NotificationsDismissedModal";
import PortalOverlay from "./PortalOverlay";
import {
  NOTIFICATIONS_CENTER_PAGE_SIZE,
  NOTIFICATION_CENTER_FILTER_OPTIONS,
  filterNotificationsCenter,
  getNotificationCenterReadCounts,
  getNotificationsCenterCatalog,
  type NotificationCenterFilter,
  type NotificationCenterIconTone,
  type NotificationCenterRow,
} from "../../data/demoNotificationsCenter";
import "../../styles/portal-modal.css";
import "../../styles/notifications-center-screen.css";

type Props = {
  closeHref: string;
  refreshToken?: number;
};

function paginationItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 4) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 2) {
    return [1, 2, 3, "ellipsis"];
  }

  if (current >= total - 1) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }

  return [1, "ellipsis", current, current + 1, "ellipsis"];
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

function NotificationIcon({ tone }: { tone: NotificationCenterIconTone }) {
  return (
    <span className={`notifications-center__icon notifications-center__icon--${tone}`}>
      <NotificationTypeIcon tone={tone} />
    </span>
  );
}

function StatusBadge({ row }: { row: NotificationCenterRow }) {
  return (
    <span className={`notifications-center__status notifications-center__status--${row.status}`}>
      {row.statusLabel}
    </span>
  );
}

export default function NotificationsCenterBody({ closeHref, refreshToken = 0 }: Props) {
  const navigate = useNavigate();
  const catalog = useMemo(() => getNotificationsCenterCatalog(), []);
  const [rows, setRows] = useState(catalog);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<NotificationCenterFilter>("all");
  const [page, setPage] = useState(1);
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [dismissedSuccessOpen, setDismissedSuccessOpen] = useState(false);
  const [closeCenterModalOpen, setCloseCenterModalOpen] = useState(false);

  useEffect(() => {
    setRows(getNotificationsCenterCatalog());
    setSearchQuery("");
    setCategoryFilter("all");
    setPage(1);
  }, [refreshToken]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryFilter]);

  const filteredRows = useMemo(
    () => filterNotificationsCenter(rows, searchQuery, categoryFilter),
    [rows, searchQuery, categoryFilter]
  );

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / NOTIFICATIONS_CENTER_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * NOTIFICATIONS_CENTER_PAGE_SIZE;
  const pageRows = filteredRows.slice(pageStart, pageStart + NOTIFICATIONS_CENTER_PAGE_SIZE);
  const showingFrom = totalEntries === 0 ? 0 : pageStart + 1;
  const showingTo = pageStart + pageRows.length;
  const pageNumbers = paginationItems(currentPage, totalPages);
  const { unread: unreadCount, read: readCount } = useMemo(
    () => getNotificationCenterReadCounts(rows),
    [rows]
  );

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const handleDismissAll = () => {
    setRows([]);
    setPage(1);
    setDismissModalOpen(false);
    setDismissedSuccessOpen(true);
  };

  return (
    <div className="admin-shell__content notifications-center">
      <div className="notifications-center__card">
        <header className="notifications-center__header">
          <h1 className="notifications-center__title">Notifications Center</h1>
          <p className="notifications-center__subtitle">
            View all recent notifications and administrative updates within your organization.
          </p>
        </header>

        <div className="notifications-center__search-wrap">
          <label className="notifications-center__search">
            <IconSearch className="notifications-center__search-icon" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notifications..."
              aria-label="Search notifications"
            />
          </label>
        </div>

        <div className="notifications-center__filters" role="tablist" aria-label="Notification filters">
          {NOTIFICATION_CENTER_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={categoryFilter === option.value}
              className={`notifications-center__filter${categoryFilter === option.value ? " notifications-center__filter--active" : ""}`}
              onClick={() => setCategoryFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="notifications-center__table-wrap">
          <table className="notifications-center__table">
            <colgroup>
              <col className="notifications-center__col-details" />
              <col className="notifications-center__col-status" />
              <col className="notifications-center__col-timeline" />
            </colgroup>
            <thead>
              <tr>
                <th>TYPE &amp; DETAILS</th>
                <th>STATUS</th>
                <th>TIMELINE</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="notifications-center__empty">
                    No notifications match your filters
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className={row.urgent ? "notifications-center__row--urgent" : undefined}
                  >
                    <td>
                      <div className="notifications-center__details">
                        <NotificationIcon tone={row.iconTone} />
                        <div className="notifications-center__details-text">
                          <span className="notifications-center__details-title">{row.title}</span>
                          <span className="notifications-center__details-subtitle">{row.subtitle}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge row={row} />
                    </td>
                    <td className="notifications-center__timeline">{row.timeline}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="notifications-center__footer">
          <span className="notifications-center__summary">
            {totalEntries === 0
              ? "Showing 0 notifications"
              : `Showing ${showingFrom}-${showingTo} of ${totalEntries} notifications`}
          </span>

          <div className="notifications-center__pagination">
            <button
              type="button"
              className="notifications-center__page-btn"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <IconChevronLeft />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="notifications-center__page-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  className={`notifications-center__page-btn notifications-center__page-btn--number${currentPage === pageNumber ? " notifications-center__page-btn--active" : ""}`}
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
              className="notifications-center__page-btn"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <IconChevronRight />
            </button>
          </div>

          <div className="notifications-center__footer-actions">
            <button
              type="button"
              className="figma-btn figma-btn--outline-green notifications-center__dismiss-btn"
              onClick={() => setDismissModalOpen(true)}
              disabled={rows.length === 0}
            >
              Dismiss All
            </button>
            <button
              type="button"
              className="figma-btn figma-btn--primary notifications-center__close-btn"
              onClick={() => setCloseCenterModalOpen(true)}
            >
              Close Center
            </button>
          </div>
        </footer>
      </div>

      <PortalOverlay open={dismissModalOpen} onClose={() => setDismissModalOpen(false)}>
        <DismissAllNotificationsModal
          count={rows.length}
          onConfirm={handleDismissAll}
          onCancel={() => setDismissModalOpen(false)}
        />
      </PortalOverlay>

      <PortalOverlay open={dismissedSuccessOpen} onClose={() => setDismissedSuccessOpen(false)}>
        <NotificationsDismissedModal onDone={() => setDismissedSuccessOpen(false)} />
      </PortalOverlay>

      <PortalOverlay open={closeCenterModalOpen} onClose={() => setCloseCenterModalOpen(false)}>
        <CloseNotificationCenterModal
          unreadCount={unreadCount}
          readCount={readCount}
          onCloseCenter={() => {
            setCloseCenterModalOpen(false);
            navigate(closeHref);
          }}
          onStay={() => setCloseCenterModalOpen(false)}
        />
      </PortalOverlay>
    </div>
  );
}
