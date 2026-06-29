import { useCallback, useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import CalendarDropdown from "../components/CalendarDropdown";
import RefreshIcon from "../components/RefreshIcon";
import { logsApi, type AuditLog, type LogsStatus } from "../api/logs.api";
import { useNotificationStore } from "../store/notificationStore";
import "../styles/logs.css";

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

const shortMonthNames = monthNames.map((month) => month.slice(0, 3));
const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatLogDate = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getLogDate = (log: AuditLog) => log.dateTime ?? log.timestamp;
const getLogUser = (log: AuditLog) => {
  const labeled = log.registeredUser ?? log.user;
  if (labeled) return labeled;

  const fullName = [log.firstName, log.lastName].filter(Boolean).join(" ").trim();
  return fullName || log.username || log.email || "-";
};
const getLogActivity = (log: AuditLog) => log.activity ?? log.action ?? "-";
const formatLogDetails = (details?: AuditLog["details"]) => {
  if (details == null || details === "") return "-";
  if (typeof details === "string") return details;

  try {
    return JSON.stringify(details);
  } catch {
    return "-";
  }
};
const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const getTodayDateInputValue = () => toDateValue(new Date());
const getDateParts = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  return { year, monthIndex: month - 1, day };
};
const formatDateButtonText = (value: string) => {
  const { year, monthIndex, day } = getDateParts(value);
  if (!year || monthIndex < 0 || !day) return "Select date";

  return `${shortMonthNames[monthIndex]} ${day}, ${year}`;
};

export default function BackupPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logStatus, setLogStatus] = useState<LogsStatus | null>(null);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const selectedDateParts = getDateParts(dateFilter);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(selectedDateParts.monthIndex);
  const [calendarYear, setCalendarYear] = useState(selectedDateParts.year);
  const push = useNotificationStore((state) => state.push);

  const load = useCallback(() => {
    return Promise.all([logsApi.list(), logsApi.status()])
      .then(([data, status]) => {
        setLogs(Array.isArray(data) ? data : []);
        setLogStatus(status);
      })
      .catch(() => push("Failed to load logs", "error"));
  }, [push]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
      push("Logs refreshed", "success");
    } finally {
      setRefreshing(false);
    }
  }, [load, push]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return logs.filter((log) => {
      const rawDate = getLogDate(log);
      const matchesDate = !dateFilter || (rawDate ? rawDate.slice(0, 10) === dateFilter : false);
      const matchesQuery =
        !normalizedQuery ||
        [getLogUser(log), getLogActivity(log), log.source, formatLogDetails(log.details), log.ipAddress]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      return matchesDate && matchesQuery;
    });
  }, [dateFilter, logs, query]);

  const hasLogs = filteredLogs.length > 0;
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const gridStart = new Date(calendarYear, calendarMonth, 1 - firstDayOfMonth.getDay());
    const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
    const visibleDayCount = firstDayOfMonth.getDay() + lastDayOfMonth.getDate();
    const totalGridDays = Math.ceil(visibleDayCount / 7) * 7;

    return Array.from({ length: totalGridDays }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      return {
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === calendarMonth,
        value: toDateValue(date),
      };
    });
  }, [calendarMonth, calendarYear]);
  const yearOptions = useMemo(
    () => Array.from({ length: 31 }, (_, index) => new Date().getFullYear() - 15 + index),
    [],
  );
  const calendarMonthOptions = useMemo(
    () => monthNames.map((month, index) => ({ label: month, value: index })),
    [],
  );
  const calendarYearOptions = useMemo(
    () => yearOptions.map((year) => ({ label: String(year), value: year })),
    [yearOptions],
  );
  const moveCalendarMonth = (direction: -1 | 1) => {
    const nextMonth = new Date(calendarYear, calendarMonth + direction, 1);
    setCalendarMonth(nextMonth.getMonth());
    setCalendarYear(nextMonth.getFullYear());
  };
  const selectCalendarDate = (value: string) => {
    const nextParts = getDateParts(value);
    setDateFilter(value);
    setCalendarMonth(nextParts.monthIndex);
    setCalendarYear(nextParts.year);
    setCalendarOpen(false);
  };

  return (
    <>
      <TopBar
        title="System Logs"
        subtitle="Activity from Super Admin, Admin, and User apps. Logs reset daily at midnight and are saved to archive files."
        showLogout={false}
      />

      <main className="logs-page">
        <section className="logs-card">
          <div className="logs-controls">
            <label className="logs-search">
              <span className="sr-only">Search logs</span>
              <img src="/assets/search-icon.svg" alt="" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search activity, user, or app..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              className="logs-date"
              type="button"
              onClick={() => {
                const nextParts = getDateParts(dateFilter || getTodayDateInputValue());
                setCalendarMonth(nextParts.monthIndex);
                setCalendarYear(nextParts.year);
                setCalendarOpen(true);
              }}
            >
              <span>{dateFilter ? formatDateButtonText(dateFilter) : "All dates"}</span>
              <img className="logs-date__icon" src="/assets/Calendar.svg" alt="" aria-hidden="true" />
            </button>
            <button
              className="logs-refresh"
              type="button"
              disabled={refreshing}
              onClick={() => void handleRefresh()}
            >
              <RefreshIcon spinning={refreshing} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="logs-table-wrap">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>App</th>
                  <th>User</th>
                  <th>Activity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr key={log.id ?? `${getLogDate(log)}-${index}`}>
                    <td>{formatLogDate(getLogDate(log))}</td>
                    <td>{log.source ?? "-"}</td>
                    <td>{getLogUser(log)}</td>
                    <td>{getLogActivity(log)}</td>
                    <td>{formatLogDetails(log.details)}</td>
                  </tr>
                ))}

                {!hasLogs && (
                  <tr>
                    <td className="logs-table__empty" colSpan={5}>
                      No activity logs for today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="logs-footer">
            <span>
              {hasLogs
                ? `Showing 1 to ${filteredLogs.length} of ${filteredLogs.length} entries today`
                : "Showing 0 entries today"}
              {logStatus?.lastArchivedFile
                ? ` · Last archive: ${logStatus.lastArchivedFile}`
                : ""}
            </span>
            {hasLogs && (
              <div className="logs-pagination" aria-label="Logs pages">
                <button type="button">‹</button>
                <button className="logs-pagination__active" type="button">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">...</button>
                <button type="button">15</button>
                <button type="button">›</button>
              </div>
            )}
          </div>
        </section>
      </main>

      {calendarOpen && (
        <div className="logs-calendar-backdrop" role="presentation" onMouseDown={() => setCalendarOpen(false)}>
          <div
            className="logs-calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Choose log date"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="logs-calendar-header">
              <button type="button" onClick={() => moveCalendarMonth(-1)} aria-label="Previous month">
                &lt;
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
                &gt;
              </button>
            </div>

            <div className="logs-calendar-weekdays">
              {weekdays.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="logs-calendar-grid">
              {calendarDays.map((date) => (
                <button
                  className={[
                    "logs-calendar-day",
                    date.isCurrentMonth ? "" : "logs-calendar-day--muted",
                    date.value === dateFilter ? "logs-calendar-day--selected" : "",
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
          </div>
        </div>
      )}
    </>
  );
}
