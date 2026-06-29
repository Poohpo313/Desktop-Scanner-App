import { useEffect, useRef, useState } from "react";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import {
  DEFAULT_HELP_SUPPORT_TROUBLESHOOTING_FILTER,
  HELP_SUPPORT_TROUBLESHOOTING_FILTER_OPTIONS,
  type HelpSupportTroubleshootingFilter,
} from "../../data/demoHelpSupportCatalog";
import "../../styles/help-support-reports-filter.css";

type Props = {
  value: HelpSupportTroubleshootingFilter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (value: HelpSupportTroubleshootingFilter) => void;
};

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

export default function HelpSupportTroubleshootingFilterDropdown({
  value,
  open,
  onOpenChange,
  onApply,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [draftValue, setDraftValue] = useState<HelpSupportTroubleshootingFilter>(value);

  useEffect(() => {
    if (open) {
      setDraftValue(value === "all" ? "resolved" : value);
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
    setDraftValue("resolved");
    onApply(DEFAULT_HELP_SUPPORT_TROUBLESHOOTING_FILTER);
    close();
  };

  const handleApply = () => {
    onApply(draftValue);
    close();
  };

  return (
    <div className="help-support-reports-filter help-support-troubleshooting-filter" ref={rootRef}>
      <button
        type="button"
        className={`help-support-screen__resolved-btn${
          value !== "all" ? " help-support-screen__resolved-btn--active" : ""
        }`}
        aria-label="Filter troubleshooting items"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        Resolved
      </button>

      {open ? (
        <div className="help-support-reports-filter__panel" role="dialog" aria-label="Troubleshooting Filter">
          <div className="help-support-reports-filter__header">
            <h2 className="help-support-reports-filter__title">Troubleshooting Filter</h2>
            <button type="button" className="help-support-reports-filter__close" aria-label="Close" onClick={close}>
              <img src={closeIcon} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="help-support-reports-filter__list" role="listbox" aria-label="Troubleshooting status">
            {HELP_SUPPORT_TROUBLESHOOTING_FILTER_OPTIONS.map((option) => {
              const isSelected = draftValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`help-support-reports-filter__option${
                    isSelected ? " help-support-reports-filter__option--selected" : ""
                  }`}
                  onClick={() => setDraftValue(option.value)}
                >
                  <span className="help-support-reports-filter__option-label">{option.label}</span>
                  {isSelected ? <IconCheck /> : null}
                </button>
              );
            })}
          </div>

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
