import FigmaModal from "./FigmaModal";
import "../../styles/settings-revocation-cancel-request-modal.css";

type Props = {
  onKeep: () => void;
  onConfirm: () => void;
};

function WarningIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M13 7.5L13 14.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="13" cy="18.25" r="1.25" fill="currentColor" />
      <path
        d="M4.75 20.25L12.1 4.35C12.45 3.65 13.55 3.65 13.9 4.35L21.25 20.25C21.62 21 21.08 21.85 20.35 21.85H5.65C4.92 21.85 4.38 21 4.75 20.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SettingsRevocationCancelRequestModal({ onKeep, onConfirm }: Props) {
  return (
    <FigmaModal
      className="figma-modal--settings-revocation-cancel"
      hideHeader
      hideClose
      onDismiss={onKeep}
      footer={
        <>
          <button type="button" className="settings-revocation-cancel__keep-btn" onClick={onKeep}>
            Keep Request
          </button>
          <button type="button" className="settings-revocation-cancel__confirm-btn" onClick={onConfirm}>
            Yes, Cancel Request
          </button>
        </>
      }
      footerClassName="settings-revocation-cancel__footer"
    >
      <div className="settings-revocation-cancel">
        <span className="settings-revocation-cancel__icon-wrap" aria-hidden="true">
          <WarningIcon />
        </span>
        <h2 className="settings-revocation-cancel__title">Cancel Request</h2>
        <p className="settings-revocation-cancel__message">
          Are you sure you want to cancel this request? This action will withdraw the request and cannot
          be undone.
        </p>
      </div>
    </FigmaModal>
  );
}
