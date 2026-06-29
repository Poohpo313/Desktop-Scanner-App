import { Check, Info, RotateCcw } from "lucide-react";
import { createPortal } from "react-dom";
import "../../styles/reset-settings-modal.css";

const RESET_ITEMS = [
  "Language",
  "Default Save Location",
  "Default File Type",
  "Scan Preferences",
] as const;

type ResetSettingsModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function ResetSettingsModal({ onCancel, onConfirm }: ResetSettingsModalProps) {
  return createPortal(
    <div className="reset-settings-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="reset-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-settings-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="reset-settings-modal__icon-wrap" aria-hidden="true">
          <RotateCcw className="reset-settings-modal__icon" strokeWidth={2} />
        </div>
        <h2 id="reset-settings-modal-title" className="reset-settings-modal__title">
          Reset Settings to Default?
        </h2>
        <p className="reset-settings-modal__desc">
          This will restore all application settings to their default values. This action cannot be
          undone.
        </p>

        <div className="reset-settings-modal__list-wrap">
          <p className="reset-settings-modal__list-title">The following settings will be reset:</p>
          <ul className="reset-settings-modal__list">
            {RESET_ITEMS.map((item) => (
              <li key={item}>
                <Check className="reset-settings-modal__check" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="reset-settings-modal__info">
          <Info className="reset-settings-modal__info-icon" strokeWidth={2} />
          <p>Your saved documents and scanned files will not be deleted.</p>
        </div>

        <footer className="reset-settings-modal__footer">
          <button type="button" className="reset-settings-modal__btn reset-settings-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="reset-settings-modal__btn reset-settings-modal__btn--confirm" onClick={onConfirm}>
            <RotateCcw className="h-4 w-4" strokeWidth={2} />
            Reset Settings
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
