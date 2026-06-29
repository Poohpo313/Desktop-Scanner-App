import { useMemo, useState } from "react";
import { previewNewExpiry } from "../lib/keyExpiry";

type DurationDaysInputProps = {
  value: number;
  onChange: (value: number) => void;
  expiresAt?: string | null;
  isExpired?: boolean;
  showPreview?: boolean;
  previewLabel?: string;
};

const SHORTCUTS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "1 Year", days: 365 },
] as const;

export function DurationDaysInput({
  value,
  onChange,
  expiresAt,
  isExpired = false,
  showPreview = true,
  previewLabel = "New expiry date",
}: DurationDaysInputProps) {
  const [activeShortcut, setActiveShortcut] = useState<number | null>(365);

  const previewDate = useMemo(
    () => previewNewExpiry(expiresAt, isExpired, value),
    [expiresAt, isExpired, value],
  );

  return (
    <div className="duration-days-input">
      <div className="duration-days-input__shortcuts">
        {SHORTCUTS.map((shortcut) => (
          <button
            key={shortcut.days}
            type="button"
            className={`duration-days-input__pill${activeShortcut === shortcut.days ? " duration-days-input__pill--active" : ""}`}
            onClick={() => {
              setActiveShortcut(shortcut.days);
              onChange(shortcut.days);
            }}
          >
            {shortcut.label}
          </button>
        ))}
      </div>

      <div className="duration-days-input__stepper">
        <button type="button" onClick={() => { setActiveShortcut(null); onChange(Math.max(1, value - 1)); }}>
          −
        </button>
        <input
          type="number"
          min={1}
          value={value}
          onChange={(event) => {
            setActiveShortcut(null);
            onChange(Math.max(1, Number(event.target.value) || 1));
          }}
        />
        <button type="button" onClick={() => { setActiveShortcut(null); onChange(value + 1); }}>
          +
        </button>
      </div>

      {showPreview ? (
        <p className="duration-days-input__preview">
          {previewLabel}:{" "}
          {previewDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </p>
      ) : null}
    </div>
  );
}
