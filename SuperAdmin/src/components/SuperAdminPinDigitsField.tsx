import type { ClipboardEvent, KeyboardEvent } from "react";
import { digitsToPin, pinToDigits } from "../lib/pinDigits";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  visible?: boolean;
  onToggleVisible?: () => void;
};

function displayDigit(digit: string, visible: boolean) {
  if (!digit) return "";
  return visible ? digit : "•";
}

export default function SuperAdminPinDigitsField({
  label,
  hint,
  value,
  onChange,
  readOnly = false,
  visible = false,
  onToggleVisible,
}: Props) {
  const digits = pinToDigits(value);
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  const handleDigit = (index: number, nextDigit: string) => {
    if (readOnly || !onChange) return;

    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    onChange(digitsToPin(nextDigits));

    if (nextDigit && index < digits.length - 1) {
      document.getElementById(`settings-pin-${fieldId}-${index + 1}`)?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, event: KeyboardEvent<HTMLDivElement>) => {
    if (readOnly || !onChange) return;

    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        handleDigit(index, "");
        return;
      }
      if (index > 0) {
        handleDigit(index - 1, "");
        document.getElementById(`settings-pin-${fieldId}-${index - 1}`)?.focus();
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      document.getElementById(`settings-pin-${fieldId}-${index - 1}`)?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < digits.length - 1) {
      event.preventDefault();
      document.getElementById(`settings-pin-${fieldId}-${index + 1}`)?.focus();
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      handleDigit(index, event.key);
    }
  };

  const handleDigitPaste = (index: number, event: ClipboardEvent<HTMLDivElement>) => {
    if (readOnly || !onChange) return;

    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits.length - index);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let offset = 0; offset < pasted.length; offset += 1) {
      nextDigits[index + offset] = pasted[offset] ?? "";
    }
    onChange(digitsToPin(nextDigits));

    const focusIndex = Math.min(index + pasted.length, digits.length - 1);
    document.getElementById(`settings-pin-${fieldId}-${focusIndex}`)?.focus();
  };

  const renderDigit = (digit: string, index: number) => {
    const className = `settings-account-pin-digit settings-account-pin-digit--display${
      readOnly ? "" : " settings-account-pin-digit--editable"
    }`;

    if (readOnly) {
      return (
        <div
          key={`${label}-${index}`}
          className={className}
          aria-label={`${label} digit ${index + 1} of 6`}
        >
          {displayDigit(digit, visible)}
        </div>
      );
    }

    return (
      <div
        key={`${label}-${index}`}
        id={`settings-pin-${fieldId}-${index}`}
        className={className}
        role="textbox"
        tabIndex={0}
        aria-label={`${label} digit ${index + 1} of 6`}
        onKeyDown={(event) => handleDigitKeyDown(index, event)}
        onPaste={(event) => handleDigitPaste(index, event)}
      >
        {displayDigit(digit, visible)}
      </div>
    );
  };

  return (
    <div className="settings-account-pin-field">
      <span className="settings-account-pin-field__label">{label}</span>
      {hint ? <small className="settings-account-pin-field__hint">{hint}</small> : null}
      <div className="settings-account-pin-row">
        <div
          className={`settings-account-pin-digits${
            readOnly ? " settings-account-pin-digits--locked" : " settings-account-pin-digits--editable"
          }`}
          aria-label={label}
        >
          {digits.map((digit, index) => renderDigit(digit, index))}
        </div>
        {onToggleVisible ? (
          <button
            type="button"
            className="settings-account-pin-toggle"
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            onClick={onToggleVisible}
          >
            {visible ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
