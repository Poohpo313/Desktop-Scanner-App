import { useEffect, useRef, useState, type ReactNode } from "react";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/filter-picker-modal.css";

export type FilterPickerOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  title: string;
  options: FilterPickerOption<T>[];
  value: T;
  triggerLabel: string;
  ariaLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (value: T) => void;
  triggerClassName?: string;
  triggerPrefix?: ReactNode;
  showChevron?: boolean;
  dropdownAlign?: "left" | "right";
  cancelLabel?: string;
  applyLabel?: string;
  onReset?: () => void;
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

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 5.5L7 9L10.5 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FilterPickerDropdown<T extends string>({
  title,
  options,
  value,
  triggerLabel,
  ariaLabel,
  open,
  onOpenChange,
  onApply,
  triggerClassName,
  triggerPrefix,
  showChevron = true,
  dropdownAlign = "left",
  cancelLabel = "Cancel",
  applyLabel = "Apply",
  onReset,
}: Props<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    if (open) {
      setDraftValue(value);
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
  const triggerClasses = triggerClassName || "filter-picker__trigger";

  return (
    <div className="filter-picker-dropdown" ref={rootRef}>
      <button
        type="button"
        className={triggerClasses}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {triggerPrefix ? (
          <span className="filter-picker__trigger-prefix">{triggerPrefix}</span>
        ) : null}
        <span className="filter-picker__trigger-label" title={triggerLabel}>
          {triggerLabel}
        </span>
        {showChevron ? <IconChevronDown className="filter-picker__trigger-chevron" /> : null}
      </button>

      {open ? (
        <div
          className={`filter-picker filter-picker--dropdown${
            dropdownAlign === "right" ? " filter-picker--dropdown-right" : ""
          }`}
        >
          <div className="filter-picker__header">
            <h2 className="filter-picker__title">{title}</h2>
            <button type="button" className="filter-picker__close" aria-label="Close" onClick={close}>
              <img src={closeIcon} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="filter-picker__list" role="listbox" aria-label={title}>
            {options.map((option) => {
              const isSelected = draftValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`filter-picker__option${isSelected ? " filter-picker__option--selected" : ""}`}
                  onClick={() => setDraftValue(option.value)}
                >
                  <span className="filter-picker__option-label" title={option.label}>
                    {option.label}
                  </span>
                  {isSelected ? <IconCheck /> : null}
                </button>
              );
            })}
          </div>

          <div className="filter-picker__footer">
            <button
              type="button"
              className="filter-picker__cancel"
              onClick={() => {
                if (onReset) {
                  onReset();
                }
                close();
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className="filter-picker__apply"
              onClick={() => {
                onApply(draftValue);
                close();
              }}
            >
              {applyLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
