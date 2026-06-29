import { useState } from "react";
import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/help-support-troubleshooting-concern-modal.css";

export type ConcernSubmissionDetails = {
  username: string;
  organization: string;
  department: string;
  concernType: string;
  category: string;
  subject: string;
  message: string;
  email: string | null;
  rating: number | null;
  submittedAt: string;
};

type Props = {
  title: string;
  statusLabel?: string;
  details: ConcernSubmissionDetails;
  onClose: () => void;
  onSendReply?: (message: string) => void;
  submitting?: boolean;
};

function formatConcernType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "feedback") return "Feedback";
  if (normalized === "issue") return "Issue Report";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatRating(rating: number | null) {
  if (rating == null) return null;
  return `${rating} / 5`;
}

export default function TroubleshootingConcernReplyModal({
  title,
  statusLabel = "Open",
  details,
  onClose,
  onSendReply,
  submitting = false,
}: Props) {
  const [reply, setReply] = useState("");
  const trimmedReply = reply.trim();
  const canSend = trimmedReply.length > 0 && !submitting;
  const ratingLabel = formatRating(details.rating);

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    onSendReply?.(trimmedReply);
  };

  return (
    <FigmaModal
      className="figma-modal--troubleshooting-concern"
      hideHeader
      hideClose
      onDismiss={onClose}
      footer={
        <>
          <button type="button" className="troubleshooting-concern__cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="troubleshooting-concern__send-btn"
            disabled={!canSend}
            onClick={handleSend}
          >
            {submitting ? "Sending..." : "Send reply"}
          </button>
        </>
      }
      footerClassName="troubleshooting-concern__footer"
    >
      <div className="troubleshooting-concern__header">
        <div className="troubleshooting-concern__header-copy">
          <div className="troubleshooting-concern__title-row">
            <h2 className="troubleshooting-concern__title">{title}</h2>
            <span className="troubleshooting-concern__status-badge">{statusLabel}</span>
          </div>
        </div>
        <button type="button" className="troubleshooting-concern__close" aria-label="Close" onClick={onClose}>
          <img src={closeIcon} alt="" aria-hidden="true" />
        </button>
      </div>

      <section className="troubleshooting-concern__details" aria-label="Submitted concern details">
        <dl className="troubleshooting-concern__details-grid">
          <div>
            <dt>User</dt>
            <dd>{details.username}</dd>
          </div>
          <div>
            <dt>Organization</dt>
            <dd>{details.organization}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{details.department}</dd>
          </div>
          <div>
            <dt>Concern type</dt>
            <dd>{formatConcernType(details.concernType)}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{details.category}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>{details.submittedAt}</dd>
          </div>
          {details.email ? (
            <div>
              <dt>Email</dt>
              <dd>{details.email}</dd>
            </div>
          ) : null}
          {ratingLabel ? (
            <div>
              <dt>Rating</dt>
              <dd>{ratingLabel}</dd>
            </div>
          ) : null}
        </dl>

        <div className="troubleshooting-concern__message-block">
          <span className="troubleshooting-concern__label">Message</span>
          <p className="troubleshooting-concern__message">{details.message}</p>
        </div>
      </section>

      <label className="troubleshooting-concern__field">
        <span className="troubleshooting-concern__label">Reply to user</span>
        <textarea
          className="troubleshooting-concern__textarea"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Type your response to resolve this concern..."
          rows={6}
        />
      </label>
    </FigmaModal>
  );
}
