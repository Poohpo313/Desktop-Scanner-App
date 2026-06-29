import { useState } from "react";
import "../styles/calendar-dropdown.css";

type CalendarDropdownOption = {
  label: string;
  value: number;
};

type CalendarDropdownProps = {
  ariaLabel: string;
  options: CalendarDropdownOption[];
  value: number;
  onChange: (value: number) => void;
};

export default function CalendarDropdown({ ariaLabel, options, value, onChange }: CalendarDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="calendar-dropdown">
      <button
        className="calendar-dropdown__button"
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedOption?.label}</span>
        <span className="calendar-dropdown__chevron" aria-hidden="true">
          v
        </span>
      </button>

      {open && (
        <div className="calendar-dropdown__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              className="calendar-dropdown__option"
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
