import { useState } from "react";
import type { UserRegistrationRow } from "../../data/demoUserRegistration";
import {
  DELETE_USER_PROFILE_REASONS,
  type DeleteUserProfileReasonId,
} from "../../data/deleteUserProfileReasons";
import FigmaModal from "./FigmaModal";
import "../../styles/delete-user-profile-modal.css";

type Props = {
  user: UserRegistrationRow;
  onCancel: () => void;
  onSubmit: (payload: { reasonId: DeleteUserProfileReasonId; otherReason?: string }) => void;
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

export default function DeleteUserProfileModal({ user, onCancel, onSubmit }: Props) {
  const [reasonId, setReasonId] = useState<DeleteUserProfileReasonId | "">("");
  const [otherReason, setOtherReason] = useState("");

  const trimmedOtherReason = otherReason.trim();
  const canSubmit =
    reasonId !== "" && (reasonId !== "others" || trimmedOtherReason.length > 0);

  const footer = (
    <div className="delete-user-profile__actions">
      <button type="button" className="delete-user-profile__cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        className="delete-user-profile__submit-btn"
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
      className="figma-modal--delete-user-profile"
      hideHeader
      hideClose
      onDismiss={onCancel}
      footer={footer}
      footerClassName="delete-user-profile__footer-wrap"
    >
      <div className="delete-user-profile">
        <div className="delete-user-profile__header">
          <div className="delete-user-profile__header-main">
            <span className="delete-user-profile__icon-wrap" aria-hidden="true">
              <IconTrash />
            </span>
            <div className="delete-user-profile__heading-copy">
              <h2 className="delete-user-profile__title">Request to Delete User</h2>
              <p className="delete-user-profile__subtitle">Are you sure you want to submit this request?</p>
            </div>
          </div>
          <button type="button" className="delete-user-profile__close" aria-label="Close" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="delete-user-profile__user-card">
          <span className="delete-user-profile__avatar" aria-hidden="true">
            {user.initials}
          </span>
          <div className="delete-user-profile__user-copy">
            <p className="delete-user-profile__user-name">{user.name}</p>
            <p className="delete-user-profile__user-serial">{user.serialKey}</p>
            <p className="delete-user-profile__user-meta">
              {user.organization} • {user.department}
            </p>
          </div>
        </div>

        <p className="delete-user-profile__reason-label">Select reason:</p>

        <div className="delete-user-profile__reason-list" role="radiogroup" aria-label="Delete reason">
          {DELETE_USER_PROFILE_REASONS.map((reason) => {
            const selected = reasonId === reason.id;

            return (
              <label
                key={reason.id}
                className={`delete-user-profile__reason-option${selected ? " delete-user-profile__reason-option--selected" : ""}`}
              >
                <input
                  type="radio"
                  name="delete-user-profile-reason"
                  className="delete-user-profile__reason-input"
                  value={reason.id}
                  checked={selected}
                  onChange={() => {
                    setReasonId(reason.id);
                    if (reason.id !== "others") {
                      setOtherReason("");
                    }
                  }}
                />
                <span className="delete-user-profile__reason-radio" aria-hidden="true">
                  {selected ? <span className="delete-user-profile__reason-radio-dot" /> : null}
                </span>
                <span className="delete-user-profile__reason-copy">
                  <span className="delete-user-profile__reason-title">{reason.label}</span>
                  {reason.description ? (
                    <span className="delete-user-profile__reason-description">{reason.description}</span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>

        {reasonId === "others" ? (
          <div className="delete-user-profile__other-reason">
            <label className="delete-user-profile__other-reason-label" htmlFor="delete-user-other-reason">
              Reason
            </label>
            <textarea
              id="delete-user-other-reason"
              className="delete-user-profile__other-reason-input"
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
