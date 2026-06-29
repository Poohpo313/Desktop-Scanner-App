import FigmaModal from "./FigmaModal";
import "../../styles/license-key-revoke-request-submitted-modal.css";

type Props = {
  onDone: () => void;
};

function SuccessCheckIcon() {
  return (
    <span className="license-key-revoke-submitted__icon" aria-hidden="true">
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

export default function LicenseKeyRevokeRequestSubmittedModal({ onDone }: Props) {
  return (
    <FigmaModal className="figma-modal--license-key-revoke-submitted" hideHeader hideClose success>
      <div className="license-key-revoke-submitted">
        <SuccessCheckIcon />
        <h2 className="license-key-revoke-submitted__title">Request Submitted Successfully!</h2>

        <p className="license-key-revoke-submitted__message">
          Your revocation request has been sent to the System Administrator for review.
        </p>

        <button type="button" className="license-key-revoke-submitted__ok-btn" onClick={onDone}>
          OK
        </button>
      </div>
    </FigmaModal>
  );
}
