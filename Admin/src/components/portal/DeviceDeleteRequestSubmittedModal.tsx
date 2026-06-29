import FigmaModal from "./FigmaModal";
import "../../styles/device-delete-request-submitted-modal.css";

type Props = {
  onDone: () => void;
};

function IconClipboardClock() {
  return (
    <svg
      className="device-delete-submitted__clipboard-icon"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
    >
      <rect x="9" y="7" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13 7V5.75C13 4.78 13.78 4 14.75 4H19.25C20.22 4 21 4.78 21 5.75V7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.5 14H21.5M12.5 18H19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="23.5" cy="23.5" r="5.25" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M23.5 21.25V23.5L25.1 24.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.35" />
      <path d="M8 7.25V11" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="8" cy="5.15" r="0.75" fill="currentColor" />
    </svg>
  );
}

function IconNote() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.5" y="2.5" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 6H10M6 8.25H8.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M10.75 10.25L11.85 11.35L14.15 9.05"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DeviceDeleteRequestSubmittedModal({ onDone }: Props) {
  return (
    <FigmaModal className="figma-modal--device-delete-submitted" hideHeader hideClose success>
      <div className="device-delete-submitted">
        <span className="device-delete-submitted__icon-wrap" aria-hidden="true">
          <IconClipboardClock />
        </span>

        <h2 className="device-delete-submitted__title">Request Submitted</h2>
        <p className="device-delete-submitted__success">
          Your deletion request has been successfully submitted.
        </p>
        <p className="device-delete-submitted__subtext">
          This device will remain active until reviewed by the System Administrator.
        </p>

        <div className="device-delete-submitted__status-banner" role="status">
          <span className="device-delete-submitted__status-icon" aria-hidden="true">
            <IconInfo />
          </span>
          <p className="device-delete-submitted__status-text">CURRENT REQUEST STATUS: PENDING APPROVAL</p>
        </div>

        <div className="device-delete-submitted__note-panel">
          <div className="device-delete-submitted__note-copy">
            <span className="device-delete-submitted__note-icon" aria-hidden="true">
              <IconNote />
            </span>
            <p className="device-delete-submitted__note-text">
              <strong>Note:</strong> The System Administrator will review the request and either approve or
              reject the deletion request. You will receive a notification once the status changes.
            </p>
          </div>
          <button type="button" className="device-delete-submitted__done-btn" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </FigmaModal>
  );
}
