import { useEffect, useId, useMemo, useRef, useState } from "react";
import "../styles/modern-date-picker.css";

export type DateRangeValue = {
  start: string;
  end: string;
};

export const EMPTY_DATE_RANGE: DateRangeValue = {
  start: "",
  end: "",
};

type Props = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
  ariaLabel?: string;
  variant?: "dropdown" | "inline";
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const MONTHS = [
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
] as const;

const YEAR_RANGE = 100;
const YEAR_OFFSET = 50;

function buildYearOptions(anchorYear: number) {
  const startYear = anchorYear - YEAR_OFFSET;
  return Array.from({ length: YEAR_RANGE }, (_, index) => startYear + index);
}

function parseIsoDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplayDate(iso: string) {
  return parseIsoDate(iso).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function normalizeRange(start: string, end: string) {
  if (!start || !end) {
    return { start, end };
  }

  return start <= end ? { start, end } : { start: end, end: start };
}

function isDateInRange(iso: string, start: string, end: string) {
  if (!start) {
    return false;
  }

  const rangeEnd = end || start;
  const min = start <= rangeEnd ? start : rangeEnd;
  const max = start <= rangeEnd ? rangeEnd : start;
  return iso >= min && iso <= max;
}

function buildCalendarDays(viewYear: number, viewMonth: number) {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let index = startOffset - 1; index >= 0; index -= 1) {
    cells.push({
      date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - index),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(viewYear, viewMonth, day),
      inMonth: true,
    });
  }

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailing; day += 1) {
    cells.push({
      date: new Date(viewYear, viewMonth + 1, day),
      inMonth: false,
    });
  }

  return cells;
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 4L6 8L10 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3.25" width="12" height="10.25" rx="1.75" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 6.25h12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.25 2v2.25M10.75 2v2.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ModernDatePicker({
  value,
  onChange,
  className,
  ariaLabel = "Select date range",
  variant = "dropdown",
}: Props) {
  const isInline = variant === "inline";
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const hasValue = value.start.length > 0;
  const anchorIso = value.start || value.end;

  const [open, setOpen] = useState(isInline);
  const [viewYear, setViewYear] = useState(() =>
    anchorIso ? parseIsoDate(anchorIso).getFullYear() : new Date().getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    anchorIso ? parseIsoDate(anchorIso).getMonth() : new Date().getMonth()
  );

  useEffect(() => {
    if (!anchorIso) {
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
      return;
    }

    const date = parseIsoDate(anchorIso);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  }, [anchorIso]);

  const finalizeRangeIfNeeded = () => {
    if (value.start && !value.end) {
      onChange({ start: value.start, end: value.start });
    }
  };

  const closePopover = () => {
    if (isInline) {
      return;
    }

    finalizeRangeIfNeeded();
    setOpen(false);
  };

  useEffect(() => {
    if (!open || isInline) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closePopover();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopover();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
    // closePopover reads latest range selection while open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value.start, value.end]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const calendarDays = useMemo(
    () => buildCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const yearOptions = useMemo(() => buildYearOptions(viewYear), [viewYear]);

  const displayValue = useMemo(() => {
    if (!value.start) {
      return "All dates";
    }

    if (!value.end) {
      return `${formatDisplayDate(value.start)} – ...`;
    }

    if (value.start === value.end) {
      return formatDisplayDate(value.start);
    }

    return `${formatDisplayDate(value.start)} – ${formatDisplayDate(value.end)}`;
  }, [value.end, value.start]);

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
      return;
    }
    setViewMonth((month) => month - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
      return;
    }
    setViewMonth((month) => month + 1);
  };

  const selectDate = (date: Date) => {
    const iso = toIsoDate(date);
    const { start, end } = value;

    if (!start || (start && end)) {
      onChange({ start: iso, end: "" });
      return;
    }

    onChange(normalizeRange(start, iso));
    if (!isInline) {
      setOpen(false);
    }
  };

  const clearValue = () => {
    onChange(EMPTY_DATE_RANGE);
    if (!isInline) {
      setOpen(false);
    }
  };

  const selectToday = () => {
    onChange({ start: toIsoDate(today), end: toIsoDate(today) });
    if (!isInline) {
      setOpen(false);
    }
  };

  const calendarPanel = (
    <div
      className={`modern-date-picker__popover${isInline ? " modern-date-picker__popover--inline" : ""}`}
      id={listboxId}
      role="dialog"
      aria-label="Calendar"
    >
      <div className="modern-date-picker__header">
        <button
          type="button"
          className="modern-date-picker__nav"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
        >
          <IconChevronLeft />
        </button>
        <div className="modern-date-picker__month-year">
          <label className="modern-date-picker__select-wrap">
            <span className="modern-date-picker__sr-only">Month</span>
            <select
              className="modern-date-picker__select modern-date-picker__select--month"
              value={viewMonth}
              onChange={(event) => setViewMonth(Number(event.target.value))}
              aria-label="Month"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <label className="modern-date-picker__select-wrap">
            <span className="modern-date-picker__sr-only">Year</span>
            <select
              className="modern-date-picker__select modern-date-picker__select--year"
              value={viewYear}
              onChange={(event) => setViewYear(Number(event.target.value))}
              aria-label="Year"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          className="modern-date-picker__nav"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <IconChevronRight />
        </button>
      </div>

      <div className="modern-date-picker__weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day} className="modern-date-picker__weekday">
            {day}
          </span>
        ))}
      </div>

      <div className="modern-date-picker__grid" role="grid">
        {calendarDays.map(({ date, inMonth }) => {
          const iso = toIsoDate(date);
          const isToday = isSameDay(date, today);

          let dayClass = "modern-date-picker__day";
          if (!inMonth) dayClass += " modern-date-picker__day--outside";
          if (isToday) dayClass += " modern-date-picker__day--today";

          let selected = false;

          if (value.start) {
            const previewEnd = value.end || value.start;
            const range = normalizeRange(value.start, previewEnd);
            const inRange = isDateInRange(iso, range.start, range.end);
            const isRangeStart = iso === range.start;
            const isRangeEnd = iso === range.end;
            selected = isRangeStart || isRangeEnd;

            if (inRange) dayClass += " modern-date-picker__day--in-range";
            if (isRangeStart) dayClass += " modern-date-picker__day--range-start";
            if (isRangeEnd) dayClass += " modern-date-picker__day--range-end";
            if (isRangeStart && isRangeEnd) dayClass += " modern-date-picker__day--range-single";
          }

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              className={dayClass}
              onClick={() => selectDate(date)}
              aria-selected={selected}
              aria-current={isToday ? "date" : undefined}
            >
              <span className="modern-date-picker__day-label">{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="modern-date-picker__footer">
        {hasValue ? (
          <button type="button" className="modern-date-picker__clear" onClick={clearValue}>
            Clear
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="modern-date-picker__today" onClick={selectToday}>
          Today
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`modern-date-picker${isInline ? " modern-date-picker--inline" : ""}${className ? ` ${className}` : ""}`}
    >
      {!isInline ? (
        <button
          type="button"
          className="modern-date-picker__trigger"
          onClick={() => setOpen((isOpen) => !isOpen)}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={listboxId}
        >
          <span
            className={`modern-date-picker__value${hasValue ? "" : " modern-date-picker__value--placeholder"}`}
          >
            {displayValue}
          </span>
          <span className="modern-date-picker__icon" aria-hidden="true">
            <IconCalendar />
          </span>
        </button>
      ) : null}

      {open || isInline ? calendarPanel : null}
    </div>
  );
}
