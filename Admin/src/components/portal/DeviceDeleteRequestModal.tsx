import { useState } from "react";
import { DEVICE_DELETE_REASONS, type DeviceDeleteReasonId } from "../../data/deviceDeleteReasons";
import FigmaModal from "./FigmaModal";
import "../../styles/device-delete-request-modal.css";

export type DeviceDeleteRequestPayload = {
  reasonId: DeviceDeleteReasonId;
  otherReason?: string;
};

type Props = {
  onCancel: () => void;
  onSubmit: (payload: DeviceDeleteRequestPayload) => void;
};

function IconTrash() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3.25 5.5H14.75M6.25 5.5V4.25C6.25 3.83579 6.58579 3.5 7 3.5H11C11.4142 3.5 11.75 3.83579 11.75 4.25V5.5M7 8.25V12.25M11 8.25V12.25M4.75 5.5L5.5 14.25C5.5 14.6642 5.83579 15 6.25 15H11.75C12.1642 15 12.5 14.6642 12.5 14.25L13.25 5.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DeviceDeleteRequestModal({ onCancel, onSubmit }: Props) {
  const [reasonId, setReasonId] = useState<DeviceDeleteReasonId | "">("");
  const [otherReason, setOtherReason] = useState("");

  const trimmedOtherReason = otherReason.trim();
  const canSubmit =
    reasonId !== "" && (reasonId !== "others" || trimmedOtherReason.length > 0);

  const footer = (
    <div className="device-delete-request__actions">
      <button type="button" className="device-delete-request__cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        className="device-delete-request__submit-btn"
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
      className="figma-modal--device-delete-request"
      hideHeader
      hideClose
      onDismiss={onCancel}
      footer={footer}
      footerClassName="device-delete-request__footer-wrap"
    >
      <div className="device-delete-request">
        <div className="device-delete-request__header">
          <div className="device-delete-request__header-main">
            <span className="device-delete-request__icon-wrap" aria-hidden="true">
              <IconTrash />
            </span>
            <div className="device-delete-request__heading-copy">
              <h2 className="device-delete-request__title">Request to Revoke Device</h2>
              <p className="device-delete-request__subtitle">
                Are you sure you want to submit this request?
              </p>
            </div>
          </div>
          <button
            type="button"
            className="device-delete-request__close"
            aria-label="Close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <p className="device-delete-request__reason-label">Select reason:</p>

        <div className="device-delete-request__reason-list" role="radiogroup" aria-label="Delete reason">
          {DEVICE_DELETE_REASONS.map((reason) => {
            const selected = reasonId === reason.id;

            return (
              <label
                key={reason.id}
                className={`device-delete-request__reason-option${
                  selected ? " device-delete-request__reason-option--selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="device-delete-reason"
                  className="device-delete-request__reason-input"
                  value={reason.id}
                  checked={selected}
                  onChange={() => {
                    setReasonId(reason.id);
                    if (reason.id !== "others") {
                      setOtherReason("");
                    }
                  }}
                />
                <span className="device-delete-request__reason-radio" aria-hidden="true">
                  {selected ? <span className="device-delete-request__reason-radio-dot" /> : null}
                </span>
                <span className="device-delete-request__reason-copy">
                  <span className="device-delete-request__reason-title">{reason.label}</span>
                  {reason.description ? (
                    <span className="device-delete-request__reason-description">
                      {reason.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>

        {reasonId === "others" ? (
          <div className="device-delete-request__other-reason">
            <label className="device-delete-request__other-reason-label" htmlFor="device-delete-other-reason">
              Reason
            </label>
            <textarea
              id="device-delete-other-reason"
              className="device-delete-request__other-reason-input"
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
