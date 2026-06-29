import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DurationDaysInput } from "./DurationDaysInput";
import { computeKeyExpiryDisplay } from "../lib/keyExpiry";
import type { SerialKey } from "../types";

type ModifyExpiryModalProps = {
  open: boolean;
  keyRecord: SerialKey | null;
  saving?: boolean;
  onClose: () => void;
  onApply: (payload: { durationDays: number; note?: string }) => void;
};

export default function ModifyExpiryModal({
  open,
  keyRecord,
  saving = false,
  onClose,
  onApply,
}: ModifyExpiryModalProps) {
  const [durationDays, setDurationDays] = useState(365);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setDurationDays(365);
    setNote("");
  }, [open, keyRecord?.serialId]);

  if (!open || !keyRecord) return null;

  const expiry = computeKeyExpiryDisplay(keyRecord.expiresAt, keyRecord.durationDays);

  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card modify-expiry-modal"
        role="dialog"
        aria-labelledby="modify-expiry-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modify-expiry-modal__header">
          <h2 id="modify-expiry-title">Modify Expiry</h2>
          <p className="modify-expiry-modal__subtitle">{keyRecord.serialKey}</p>
        </header>

        <div className="modify-expiry-modal__summary">
          <p>
            Current expiry:{" "}
            {keyRecord.expiresAt
              ? new Date(keyRecord.expiresAt).toLocaleDateString()
              : "Never"}
          </p>
          <p>
            Days remaining:{" "}
            {expiry.threshold === "expired"
              ? "Expired"
              : expiry.daysRemaining ?? "N/A"}
          </p>
        </div>

        <DurationDaysInput
          value={durationDays}
          onChange={setDurationDays}
          expiresAt={keyRecord.expiresAt}
          isExpired={expiry.isExpired}
        />

        <label className="modify-expiry-modal__note">
          <span>Note (optional)</span>
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Reason for this extension..."
          />
        </label>

        <footer className="modify-expiry-modal__actions">
          <button type="button" className="scan-btn scan-btn--outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="scan-btn scan-btn--primary"
            disabled={saving}
            onClick={() => onApply({ durationDays, note: note.trim() || undefined })}
          >
            {saving ? "Applying…" : "Apply Extension"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
