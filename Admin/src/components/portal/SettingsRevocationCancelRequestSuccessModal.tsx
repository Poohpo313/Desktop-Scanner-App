import FigmaModal from "./FigmaModal";
import "../../styles/settings-revocation-cancel-request-success-modal.css";

type Props = {
  referenceId: string;
  onDone: () => void;
};

function SuccessCheckIcon() {
  return (
    <span className="settings-revocation-cancel-success__icon" aria-hidden="true">
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

export default function SettingsRevocationCancelRequestSuccessModal({ referenceId, onDone }: Props) {
  return (
    <FigmaModal
      className="figma-modal--settings-revocation-cancel-success"
      hideHeader
      hideClose
      success
      onDismiss={onDone}
    >
      <div className="settings-revocation-cancel-success">
        <SuccessCheckIcon />
        <h2 className="settings-revocation-cancel-success__title">Request Cancelled</h2>
        <p className="settings-revocation-cancel-success__message">
          Request <strong>{referenceId}</strong> has been successfully cancelled and withdrawn from
          review.
        </p>
        <button type="button" className="settings-revocation-cancel-success__done-btn" onClick={onDone}>
          Done
        </button>
      </div>
    </FigmaModal>
  );
}
