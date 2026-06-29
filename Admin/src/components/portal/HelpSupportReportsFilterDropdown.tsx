import { useEffect, useRef, useState } from "react";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import ModernDatePicker, { EMPTY_DATE_RANGE } from "../ModernDatePicker";
import {
  DEFAULT_HELP_SUPPORT_REPORTS_FILTER,
  HELP_SUPPORT_CATEGORY_FILTER_OPTIONS,
  HELP_SUPPORT_REPORTS_FILTER_DIMENSIONS,
  HELP_SUPPORT_STATUS_FILTER_OPTIONS,
  type HelpSupportReportsFilter,
  type HelpSupportReportsFilterDimension,
} from "../../data/demoHelpSupportCatalog";
import "../../styles/help-support-reports-filter.css";
import "../../styles/modern-date-picker.css";

type Props = {
  value: HelpSupportReportsFilter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (value: HelpSupportReportsFilter) => void;
};

type FilterView = "menu" | HelpSupportReportsFilterDimension;

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.25L6.5 11.25L12.5 4.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function dimensionOptions(dimension: HelpSupportReportsFilterDimension) {
  if (dimension === "category") {
    return HELP_SUPPORT_CATEGORY_FILTER_OPTIONS;
  }

  return HELP_SUPPORT_STATUS_FILTER_OPTIONS;
}

function dimensionLabel(dimension: HelpSupportReportsFilterDimension): string {
  return HELP_SUPPORT_REPORTS_FILTER_DIMENSIONS.find((item) => item.value === dimension)?.label ?? dimension;
}

function finalizeDateRange(filter: HelpSupportReportsFilter): HelpSupportReportsFilter {
  if (!filter.dateRange.start) {
    return filter;
  }

  if (filter.dateRange.end) {
    return filter;
  }

  return {
    ...filter,
    dateRange: {
      start: filter.dateRange.start,
      end: filter.dateRange.start,
    },
  };
}

export default function HelpSupportReportsFilterDropdown({ value, open, onOpenChange, onApply }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<FilterView>("menu");
  const [draftFilter, setDraftFilter] = useState<HelpSupportReportsFilter>(value);
  const [selectedDimension, setSelectedDimension] = useState<HelpSupportReportsFilterDimension>("status");

  useEffect(() => {
    if (open) {
      setDraftFilter(value);
      setView("menu");
      setSelectedDimension("status");
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, onOpenChange]);

  const close = () => onOpenChange(false);

  const handleReset = () => {
    const resetFilter: HelpSupportReportsFilter = {
      ...DEFAULT_HELP_SUPPORT_REPORTS_FILTER,
      dateRange: { ...EMPTY_DATE_RANGE },
    };

    setDraftFilter(resetFilter);
    setView("menu");
    setSelectedDimension("status");
    onApply(resetFilter);
    close();
  };

  const handleApply = () => {
    if (view === "menu") {
      setView(selectedDimension);
      return;
    }

    onApply(finalizeDateRange(draftFilter));
    close();
  };

  const menuOptions = HELP_SUPPORT_REPORTS_FILTER_DIMENSIONS;
  const detailOptions = view === "menu" || view === "date" ? [] : dimensionOptions(view);
  const detailValue = view === "menu" || view === "date" ? "all" : draftFilter[view];

  return (
    <div className="help-support-reports-filter" ref={rootRef}>
      <button
        type="button"
        className="help-support-screen__filter-btn"
        aria-label="Filter support reports"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        Filter
      </button>

      {open ? (
        <div
          className={`help-support-reports-filter__panel${
            view === "date" ? " help-support-reports-filter__panel--date" : ""
          }`}
          role="dialog"
          aria-label="Reports Filter"
        >
          <div className="help-support-reports-filter__header">
            <h2 className="help-support-reports-filter__title">
              {view === "menu" ? "Reports Filter" : dimensionLabel(view)}
            </h2>
            <button type="button" className="help-support-reports-filter__close" aria-label="Close" onClick={close}>
              <img src={closeIcon} alt="" aria-hidden="true" />
            </button>
          </div>

          {view === "date" ? (
            <div className="help-support-reports-filter__calendar">
              <ModernDatePicker
                variant="inline"
                value={draftFilter.dateRange}
                onChange={(dateRange) =>
                  setDraftFilter((current) => ({
                    ...current,
                    dateRange,
                  }))
                }
                ariaLabel="Filter reports by date range"
              />
            </div>
          ) : (
            <div className="help-support-reports-filter__list" role="listbox">
              {view === "menu"
                ? menuOptions.map((option) => {
                    const isSelected = selectedDimension === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`help-support-reports-filter__option${
                          isSelected ? " help-support-reports-filter__option--selected" : ""
                        }`}
                        onClick={() => setSelectedDimension(option.value)}
                      >
                        <span className="help-support-reports-filter__option-label">{option.label}</span>
                        {isSelected ? <IconCheck /> : null}
                      </button>
                    );
                  })
                : detailOptions.map((option) => {
                    const isSelected = detailValue === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`help-support-reports-filter__option${
                          isSelected ? " help-support-reports-filter__option--selected" : ""
                        }`}
                        onClick={() =>
                          setDraftFilter((current) => ({
                            ...current,
                            [view]: option.value,
                          }))
                        }
                      >
                        <span className="help-support-reports-filter__option-label">{option.label}</span>
                        {isSelected ? <IconCheck /> : null}
                      </button>
                    );
                  })}
            </div>
          )}

          <div className="help-support-reports-filter__footer">
            <button type="button" className="help-support-reports-filter__reset" onClick={handleReset}>
              Reset
            </button>
            <button type="button" className="help-support-reports-filter__apply" onClick={handleApply}>
              Apply Filter
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
