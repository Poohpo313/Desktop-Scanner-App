import { Check, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ScanModalShell } from "./ScanModalShell";

export type SelectionOption = {
  id: string;
  label: string;
  description?: string;
  badge?: string;
};

type SelectionModalProps = {
  title: string;
  subtitle?: string;
  options: SelectionOption[];
  value: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  summaryLabel?: string;
  showSummary?: boolean;
  footerNote?: string;
  usePortal?: boolean;
  elevated?: boolean;
  closeOnApply?: boolean;
  onApply: (value: string) => void;
  onClose: () => void;
};

export function SelectionModal({
  title,
  subtitle,
  options,
  value,
  searchable = false,
  searchPlaceholder = "Search…",
  summaryLabel = "Selected",
  showSummary = true,
  footerNote,
  usePortal = false,
  elevated = false,
  closeOnApply = true,
  onApply,
  onClose,
}: SelectionModalProps) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const selected = options.find((o) => o.id === draft);

  return (
    <ScanModalShell
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      usePortal={usePortal}
      elevated={elevated}
      footer={
        <>
          <button type="button" className="scan-btn scan-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="scan-btn scan-btn--primary"
            onClick={() => {
              onApply(draft);
              if (closeOnApply) onClose();
            }}
          >
            Apply
          </button>
        </>
      }
    >
      {searchable ? (
        <div className="scan-modal-search">
          <Search className="scan-modal-search__icon" strokeWidth={1.8} />
          <input
            type="search"
            className="scan-modal-search__input"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      ) : null}

      <div className="scan-selection-list">
        {filtered.map((option) => {
          const active = option.id === draft;
          return (
            <button
              key={option.id}
              type="button"
              className={`scan-selection-list__item${active ? " scan-selection-list__item--active" : ""}`}
              onClick={() => setDraft(option.id)}
            >
              <span className="scan-selection-list__text">
                <span className="scan-selection-list__label">{option.label}</span>
                {option.description ? (
                  <span className="scan-selection-list__desc">{option.description}</span>
                ) : null}
              </span>
              <span className="scan-selection-list__meta">
                {option.badge ? (
                  <span className="scan-selection-list__badge">{option.badge}</span>
                ) : null}
                {active ? <Check className="scan-selection-list__check" strokeWidth={2.5} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      {selected && showSummary ? (
        <div className="scan-selection-summary">
          <span className="scan-selection-summary__label">{summaryLabel}:</span>
          <span className="scan-selection-summary__value">
            {selected.description ? `${selected.label} — ${selected.description}` : selected.label}
          </span>
        </div>
      ) : null}

      {footerNote ? <p className="scan-modal-note">{footerNote}</p> : null}
    </ScanModalShell>
  );
}
