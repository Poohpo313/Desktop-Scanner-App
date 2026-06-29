import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { keysApi } from "../api/keys.api";
import { extractApiError } from "../lib/extractApiError";
import { useNotificationStore } from "../store/notificationStore";
import { DurationDaysInput } from "./DurationDaysInput";
import type { KeyExtensionRequest } from "./KeyExtensionRequestsPanel";

type ApproveKeyRequestModalProps = {
  open: boolean;
  request: KeyExtensionRequest | null;
  onClose: () => void;
  onApproved: () => void;
};

export default function ApproveKeyRequestModal({
  open,
  request,
  onClose,
  onApproved,
}: ApproveKeyRequestModalProps) {
  const [durationDays, setDurationDays] = useState(365);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const push = useNotificationStore((state) => state.push);

  useEffect(() => {
    if (!open || !request) return;
    setDurationDays(request.requestedDays || 365);
    setNote("");
  }, [open, request]);

  if (!open || !request) return null;

  async function handleApprove() {
    setSaving(true);
    try {
      await keysApi.approveExtensionRequest(request!.requestId, {
        requestedDays: durationDays,
        superadminNote: note.trim() || undefined,
      });
      push("Request approved and expiry updated.", "success");
      onApproved();
    } catch (error) {
      push(extractApiError(error, "Could not approve request."), "error");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card modify-expiry-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
        <header className="modify-expiry-modal__header">
          <h2>Approve {request.type === "renewal" ? "Renewal" : "Extension"}</h2>
          <p className="modify-expiry-modal__subtitle">{request.serialKey}</p>
        </header>

        <DurationDaysInput value={durationDays} onChange={setDurationDays} isExpired={request.type === "renewal"} />

        <label className="modify-expiry-modal__note">
          <span>Super Admin note (optional)</span>
          <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>

        <footer className="modify-expiry-modal__actions">
          <button type="button" className="scan-btn scan-btn--outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="scan-btn scan-btn--primary" onClick={() => void handleApprove()} disabled={saving}>
            {saving ? "Approving…" : "Confirm Approval"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
