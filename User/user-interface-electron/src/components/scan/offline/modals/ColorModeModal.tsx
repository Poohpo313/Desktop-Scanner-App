import { Check } from "lucide-react";
import { useState } from "react";
import { COLOR_MODES } from "../scanOfflineData";
import { ScanModalShell } from "./ScanModalShell";

type ColorModeModalProps = {
  value: string;
  onApply: (value: string) => void;
  onClose: () => void;
};

function ColorModeIcon({ id }: { id: string }) {
  if (id === "color") {
    return <span className="scan-color-icon scan-color-icon--color" aria-hidden="true" />;
  }
  if (id === "grayscale") {
    return <span className="scan-color-icon scan-color-icon--gray" aria-hidden="true" />;
  }
  return <span className="scan-color-icon scan-color-icon--bw" aria-hidden="true" />;
}

export function ColorModeModal({ value, onApply, onClose }: ColorModeModalProps) {
  const [draft, setDraft] = useState(value);

  return (
    <ScanModalShell
      title="Color Mode"
      onClose={onClose}
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
              onClose();
            }}
          >
            Apply
          </button>
        </>
      }
    >
      <div className="scan-selection-list">
        {COLOR_MODES.map((option) => {
          const active = option.id === draft;
          return (
            <button
              key={option.id}
              type="button"
              className={`scan-selection-list__item scan-selection-list__item--with-icon${
                active ? " scan-selection-list__item--active" : ""
              }`}
              onClick={() => setDraft(option.id)}
            >
              <ColorModeIcon id={option.id} />
              <span className="scan-selection-list__text">
                <span className="scan-selection-list__label">{option.label}</span>
                <span className="scan-selection-list__desc">{option.description}</span>
              </span>
              {active ? <Check className="scan-selection-list__check" strokeWidth={2.5} /> : null}
            </button>
          );
        })}
      </div>

      <p className="scan-modal-note">
        Color mode affects both scan quality and final file size.
      </p>
    </ScanModalShell>
  );
}
