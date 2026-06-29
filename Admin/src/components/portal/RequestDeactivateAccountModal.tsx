import FigmaModal from "./FigmaModal";
import "../../styles/request-deactivate-account-modal.css";

type Props = {
  onCancel: () => void;
  onSubmit: () => void;
};

function IconWarningTriangle() {
  return (
    <svg className="request-deactivate__warning-icon" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M13 5.5L22.5 20.5H3.5L13 5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M13 11V15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="13" cy="18.25" r="0.95" fill="currentColor" />
    </svg>
  );
}

export default function RequestDeactivateAccountModal({ onCancel, onSubmit }: Props) {
  return (
    <FigmaModal
      className="figma-modal--request-deactivate"
      hideHeader
      hideClose
      onDismiss={onCancel}
    >
      <div className="request-deactivate">
        <span className="request-deactivate__icon-wrap" aria-hidden="true">
          <IconWarningTriangle />
        </span>

        <h2 className="request-deactivate__title">Request to deactivate</h2>

        <div className="request-deactivate__message" role="note">
          Are you sure you want to request account deactivation?
        </div>

        <div className="request-deactivate__actions">
          <button type="button" className="request-deactivate__cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="request-deactivate__submit-btn" onClick={onSubmit}>
            Submit Request
          </button>
        </div>
      </div>
    </FigmaModal>
  );
}
