import { useCallback, useEffect, useMemo, useState } from "react";
import CalendarDropdown from "../components/CalendarDropdown";
import TopBar from "../components/TopBar";
import HelpRequestDetailModal from "../components/HelpRequestDetailModal";
import { userConcernsApi } from "../api/userConcerns.api";
import { extractApiError } from "../lib/extractApiError";
import { mapUserConcernsToHelpRequests, type HelpRequestRow } from "../lib/helpMappers";
import { useNotificationStore } from "../store/notificationStore";
import "../styles/help.css";
import "../styles/help-request-detail-modal.css";

type SupportStatus = "Open" | "Pending" | "In Progress" | "Resolved" | "Closed";

const statusFilters = ["All", "Open", "Pending", "In Progress", "Resolved", "Closed"] as const;
const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const commonIssueLabels = [
  "Device registration failure",
  "Synchronization error",
  "Connectivity issue",
  "Configuration issue",
  "Serial Key",
];
const faqItems = [
  "How do I register a scanner?",
  "What if sync keeps failing?",
  "Where do I find my serial key?",
  "Fixing a connectivity error",
];

const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getDateParts = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
};

const formatDateButtonText = (value: string) => {
  const { year, monthIndex, day } = getDateParts(value);
  if (!year || monthIndex < 0 || !day) return "Select date";

  return `${String(monthIndex + 1).padStart(2, "0")} / ${String(day).padStart(2, "0")} / ${year}`;
};

const formatTableDate = (value: string) => {
  const { year, monthIndex, day } = getDateParts(value);
  if (!year || monthIndex < 0 || !day) return "-";

  return `${shortMonthNames[monthIndex]} ${day}, ${year}`;
};

const getStatusTone = (status: SupportStatus) => status.toLowerCase().replace(/\s+/g, "-");

export default function HelpPage() {
  const [requests, setRequests] = useState(() => mapUserConcernsToHelpRequests([]));
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<(typeof statusFilters)[number]>("All");
  const [dateFilter, setDateFilter] = useState("");
  const selectedDateParts = getDateParts(dateFilter || toDateValue(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(selectedDateParts.monthIndex);
  const [calendarYear, setCalendarYear] = useState(selectedDateParts.year);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestRow | null>(null);
  const push = useNotificationStore((state) => state.push);

  const load = useCallback(async () => {
    try {
      const concerns = await userConcernsApi.list();
      setRequests(mapUserConcernsToHelpRequests(concerns));
    } catch (error) {
      push(extractApiError(error, "Failed to load support requests"), "error");
    }
  }, [push]);

  useEffect(() => {
    void load();
  }, [load]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const gridStart = new Date(calendarYear, calendarMonth, 1 - firstDayOfMonth.getDay());
    const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
    const totalSlots = Math.ceil((firstDayOfMonth.getDay() + lastDayOfMonth.getDate()) / 7) * 7;

    return Array.from({ length: totalSlots }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      return {
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === calendarMonth,
        value: toDateValue(date),
      };
    });
  }, [calendarMonth, calendarYear]);

  const calendarMonthOptions = monthNames.map((month, index) => ({ label: month, value: index }));
  const calendarYearOptions = Array.from({ length: 41 }, (_, index) => new Date().getFullYear() - 20 + index).map(
    (year) => ({ label: String(year), value: year }),
  );

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = activeStatus === "All" || request.status === activeStatus;
      const matchesDate = !dateFilter || request.date === dateFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          request.id,
          request.serialKey,
          request.organization,
          request.subject,
          request.category,
          request.status,
          request.requester,
          request.message,
          request.concernType,
          request.department,
          request.email,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesDate && matchesQuery;
    });
  }, [activeStatus, dateFilter, query, requests]);

  const resolvedCount = requests.filter((request) => request.status === "Resolved").length;
  const openCount = requests.filter((request) => request.status !== "Resolved" && request.status !== "Closed").length;
  const issueCounts = commonIssueLabels.map((label) => ({
    label,
    count: requests.filter((request) => request.category.toLowerCase() === label.toLowerCase()).length,
  }));
  const moveCalendarMonth = (direction: -1 | 1) => {
    const nextMonth = new Date(calendarYear, calendarMonth + direction, 1);
    setCalendarMonth(nextMonth.getMonth());
    setCalendarYear(nextMonth.getFullYear());
  };
  const selectCalendarDate = (value: string) => {
    setDateFilter(value);
    const { year, monthIndex } = getDateParts(value);
    setCalendarMonth(monthIndex);
    setCalendarYear(year);
    setCalendarOpen(false);
  };

  return (
    <>
      <TopBar
        title="Desktop Scanner System Administrator Console"
        sectionLabel="Help & Support Center"
        subtitle="Visit the Help Center or contact support to troubleshoot device registration issues."
        showLogout={false}
        variant="dashboard"
      >
        <div className="help-topbar-tools">
          <label className="help-topbar-search">
            <span className="sr-only">Search reports or issues</span>
            <input
              type="search"
              placeholder="Search reports or issues..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button className="help-date-button" type="button" onClick={() => setCalendarOpen(true)}>
            <span>{dateFilter ? formatDateButtonText(dateFilter) : "All dates"}</span>
            <img src="/assets/Calendar.svg" alt="" aria-hidden="true" />
          </button>
          {dateFilter ? (
            <button className="help-date-clear" type="button" onClick={() => setDateFilter("")}>
              Clear date
            </button>
          ) : null}
        </div>
      </TopBar>

      <main className="help-page">
        <section className="help-main-column">
          <div className="help-summary-grid">
            <article className="help-summary-card help-summary-card--total">
              <span>Total Support Requests</span>
              <strong>{requests.length}</strong>
              <p>All time</p>
            </article>
            <article className="help-summary-card help-summary-card--resolved">
              <span>Resolved Issues</span>
              <strong>{resolvedCount}</strong>
              <p>{requests.length ? Math.round((resolvedCount / requests.length) * 100) : 0}% resolved</p>
            </article>
            <article className="help-summary-card help-summary-card--open">
              <span>Open Tickets</span>
              <strong>{openCount}</strong>
              <p>{requests.length ? Math.round((openCount / requests.length) * 100) : 0}% open</p>
            </article>
          </div>

          <section className="help-requests-card">
            <div className="help-status-tabs" aria-label="Support request filters">
              {statusFilters.map((status) => (
                <button
                  className={activeStatus === status ? "help-status-tab help-status-tab--active" : "help-status-tab"}
                  key={status}
                  type="button"
                  onClick={() => setActiveStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="help-table-wrap">
              <table className="help-requests-table">
                <thead>
                  <tr>
                    <th>Serial Key</th>
                    <th>Organization</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="help-requests-table__row--clickable"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <td>
                        <strong>{request.serialKey}</strong>
                        {request.requester && <span>{request.requester}</span>}
                      </td>
                      <td>{request.organization}</td>
                      <td>{request.subject}</td>
                      <td>{request.category}</td>
                      <td>{formatTableDate(request.date)}</td>
                      <td>
                        <span className={`help-status-badge help-status-badge--${getStatusTone(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td className="help-empty" colSpan={6}>
                        No support requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="help-table-footer">
              Showing {filteredRequests.length ? `1 to ${filteredRequests.length} of ${filteredRequests.length}` : "0"} entries
              <div className="help-pagination" aria-label="Support request pages">
                <button type="button">‹</button>
                <button className="help-pagination__active" type="button">
                  1
                </button>
                <button type="button">›</button>
              </div>
            </div>
          </section>
        </section>

        <aside className="help-side-column">
          <section className="help-side-card">
            <h2>Most Common Issues</h2>
            <div className="help-issue-list">
              {issueCounts.map((issue) => (
                <div key={issue.label}>
                  <span>{issue.label}</span>
                  <strong>{issue.count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="help-side-card">
            <h2>FAQs &amp; troubleshooting</h2>
            <div className="help-faq-list">
              {faqItems.map((item) => (
                <button key={item} type="button">
                  {item}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </main>

      <HelpRequestDetailModal
        open={!!selectedRequest}
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />

      {calendarOpen && (
        <div className="help-calendar-backdrop" role="presentation" onMouseDown={() => setCalendarOpen(false)}>
          <section
            className="help-calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Choose help date"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="help-calendar-header">
              <button type="button" onClick={() => moveCalendarMonth(-1)} aria-label="Previous month">
                ‹
              </button>
              <CalendarDropdown
                ariaLabel="Month"
                options={calendarMonthOptions}
                value={calendarMonth}
                onChange={setCalendarMonth}
              />
              <CalendarDropdown
                ariaLabel="Year"
                options={calendarYearOptions}
                value={calendarYear}
                onChange={setCalendarYear}
              />
              <button type="button" onClick={() => moveCalendarMonth(1)} aria-label="Next month">
                ›
              </button>
            </div>

            <div className="help-calendar-weekdays">
              {weekdays.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="help-calendar-grid">
              {calendarDays.map((date) => (
                <button
                  className={[
                    "help-calendar-day",
                    !date.isCurrentMonth ? "help-calendar-day--muted" : "",
                    date.value === dateFilter ? "help-calendar-day--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={date.value}
                  type="button"
                  onClick={() => selectCalendarDate(date.value)}
                >
                  {date.day}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
