import { useState } from "react";
import {
  LICENSE_KEY_REVOKE_REASONS,
  type LicenseKeyRevokeReasonId,
} from "../../data/licenseKeyRevokeReasons";
import FigmaModal from "./FigmaModal";
import "../../styles/license-key-revoke-request-modal.css";

export type LicenseKeyRevokeRequestPayload = {
  reasonId: LicenseKeyRevokeReasonId;
  otherReason?: string;
};

type Props = {
  onCancel: () => void;
  onSubmit: (payload: LicenseKeyRevokeRequestPayload) => void;
};

function IconProhibited() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 6.5L15.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function LicenseKeyRevokeRequestModal({ onCancel, onSubmit }: Props) {
  const [reasonId, setReasonId] = useState<LicenseKeyRevokeReasonId | "">("");
  const [otherReason, setOtherReason] = useState("");

  const trimmedOtherReason = otherReason.trim();
  const canSubmit =
    reasonId !== "" && (reasonId !== "others" || trimmedOtherReason.length > 0);

  const footer = (
    <div className="license-key-revoke-request__actions">
      <button type="button" className="license-key-revoke-request__cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        className="license-key-revoke-request__submit-btn"
        disabled={!canSubmit}
        onClick={() => {
          if (!canSubmit || !reasonId) {
            return;
          }

          onSubmit({
            reasonId,
            otherReason: reasonId === "others" ? trimmedOtherReason : undefined,
          });
        }}
      >
        Submit Request
      </button>
    </div>
  );

  return (
    <FigmaModal
      className="figma-modal--license-key-revoke-request"
      hideHeader
      hideClose
      onDismiss={onCancel}
      footer={footer}
      footerClassName="license-key-revoke-request__footer-wrap"
    >
      <div className="license-key-revoke-request">
        <div className="license-key-revoke-request__header">
          <div className="license-key-revoke-request__header-main">
            <span className="license-key-revoke-request__icon-wrap" aria-hidden="true">
              <IconProhibited />
            </span>
            <div className="license-key-revoke-request__heading-copy">
              <h2 className="license-key-revoke-request__title">Request to Revoke Key</h2>
              <p className="license-key-revoke-request__subtitle">
                Are you sure you want to submit this request?
              </p>
            </div>
          </div>
          <button
            type="button"
            className="license-key-revoke-request__close"
            aria-label="Close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <p className="license-key-revoke-request__reason-label">Select reason:</p>

        <div className="license-key-revoke-request__reason-list" role="radiogroup" aria-label="Revoke reason">
          {LICENSE_KEY_REVOKE_REASONS.map((reason) => {
            const selected = reasonId === reason.id;

            return (
              <label
                key={reason.id}
                className={`license-key-revoke-request__reason-option${
                  selected ? " license-key-revoke-request__reason-option--selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="license-key-revoke-reason"
                  className="license-key-revoke-request__reason-input"
                  value={reason.id}
                  checked={selected}
                  onChange={() => {
                    setReasonId(reason.id);
                    if (reason.id !== "others") {
                      setOtherReason("");
                    }
                  }}
                />
                <span className="license-key-revoke-request__reason-radio" aria-hidden="true">
                  {selected ? <span className="license-key-revoke-request__reason-radio-dot" /> : null}
                </span>
                <span className="license-key-revoke-request__reason-copy">
                  <span className="license-key-revoke-request__reason-title">{reason.label}</span>
                  {reason.description ? (
                    <span className="license-key-revoke-request__reason-description">
                      {reason.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>

        {reasonId === "others" ? (
          <div className="license-key-revoke-request__other-reason">
            <label className="license-key-revoke-request__other-reason-label" htmlFor="license-key-revoke-other-reason">
              Reason
            </label>
            <textarea
              id="license-key-revoke-other-reason"
              className="license-key-revoke-request__other-reason-input"
              value={otherReason}
              onChange={(event) => setOtherReason(event.target.value)}
              placeholder="Enter reason"
              rows={3}
            />
          </div>
        ) : null}
      </div>
    </FigmaModal>
  );
}
