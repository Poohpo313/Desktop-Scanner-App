import FigmaModal from "./FigmaModal";
import "../../styles/help-support-reply-sent-modal.css";

type Props = {
  onBack: () => void;
};

function SuccessCheckIcon() {
  return (
    <span className="reply-sent__icon" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <path
          d="M8.5 17.25L14.25 23L25.5 11.75"
          stroke="currentColor"
          strokeWidth="3.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function TroubleshootingReplySentModal({ onBack }: Props) {
  return (
    <FigmaModal className="figma-modal--reply-sent" hideHeader hideClose onDismiss={onBack}>
      <div className="reply-sent">
        <SuccessCheckIcon />
        <h2 className="reply-sent__title">Reply Sent</h2>
        <p className="reply-sent__message">
          The user has been notified by email and the concern is now marked as resolved.
        </p>
        <button type="button" className="reply-sent__back-btn" onClick={onBack}>
          Back to troubleshooting
        </button>
      </div>
    </FigmaModal>
  );
}
