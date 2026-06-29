import { Check, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type SettingsRowProps = {
  label: string;
  value: ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  valueTone?: "default" | "muted";
};

export function SettingsRow({
  label,
  value,
  onClick,
  showChevron = true,
  valueTone = "muted",
}: SettingsRowProps) {
  const valueClassName =
    valueTone === "muted" ? "settings-row__value settings-row__value--muted" : "settings-row__value";

  if (onClick) {
    return (
      <button type="button" className="settings-row settings-row--link" onClick={onClick}>
        <span className="settings-row__label">{label}</span>
        <span className={valueClassName}>{value}</span>
        {showChevron ? (
          <ChevronRight className="settings-row__chevron" strokeWidth={2} aria-hidden="true" />
        ) : null}
      </button>
    );
  }

  return (
    <div className="settings-row">
      <span className="settings-row__label">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}

type SettingsToggleRowProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function SettingsToggleRow({ label, checked, onChange, disabled }: SettingsToggleRowProps) {
  return (
    <div className="settings-row settings-row--toggle">
      <span className="settings-row__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`settings-toggle${checked ? " settings-toggle--on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="settings-toggle__thumb" />
      </button>
    </div>
  );
}

export function SaveModeCard({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`save-pref-mode-card${selected ? " save-pref-mode-card--selected" : ""}`}
      onClick={onSelect}
    >
      <span className="save-pref-mode-card__header">
        <span className="save-pref-mode-card__title">{title}</span>
        {selected ? (
          <span className="save-pref-mode-card__check" aria-hidden="true">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
        ) : (
          <span className="save-pref-mode-card__radio" aria-hidden="true" />
        )}
      </span>
      <span className="save-pref-mode-card__description">{description}</span>
    </button>
  );
}
