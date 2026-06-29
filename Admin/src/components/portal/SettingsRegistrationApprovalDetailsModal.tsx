import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import { SETTINGS_REGISTRATION_APPROVAL_DETAILS } from "../../data/demoSettingsRegistrationApprovalDetails";
import "../../styles/settings-registration-approval-details-modal.css";

type Props = {
  onClose: () => void;
};

function IconApprovedStatus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M3.75 6L5.35 7.6L8.25 4.7"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SettingsRegistrationApprovalDetailsModal({ onClose }: Props) {
  const details = SETTINGS_REGISTRATION_APPROVAL_DETAILS;

  const footer = (
    <button type="button" className="settings-registration-approval-details__close-btn" onClick={onClose}>
      Close
    </button>
  );

  return (
    <FigmaModal
      className="figma-modal--settings-registration-approval-details"
      title="Registration Approval Details"
      subtitle="Review the details of the approved registration request."
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="settings-registration-approval-details__footer-wrap"
    >
      <section className="settings-registration-approval-details__section">
        <h3 className="settings-registration-approval-details__section-label">Request Information</h3>
        <div className="settings-registration-approval-details__grid">
          <div className="settings-registration-approval-details__item">
            <span className="settings-registration-approval-details__field-label">Request ID</span>
            <span className="settings-registration-approval-details__field-value">{details.requestId}</span>
          </div>
          <div className="settings-registration-approval-details__item">
            <span className="settings-registration-approval-details__field-label">Scanner ID</span>
            <span className="settings-registration-approval-details__field-value">{details.scannerId}</span>
          </div>
          <div className="settings-registration-approval-details__item">
            <span className="settings-registration-approval-details__field-label">Requested By</span>
            <span className="settings-registration-approval-details__field-value">{details.requestedBy}</span>
          </div>
          <div className="settings-registration-approval-details__item">
            <span className="settings-registration-approval-details__field-label">Department</span>
            <span className="settings-registration-approval-details__field-value">{details.department}</span>
          </div>
        </div>
      </section>

      <section className="settings-registration-approval-details__section">
        <h3 className="settings-registration-approval-details__section-label">Approval Information</h3>
        <div className="settings-registration-approval-details__grid">
          <div className="settings-registration-approval-details__item">
            <span className="settings-registration-approval-details__field-label">Approved By</span>
            <span className="settings-registration-approval-details__field-value">{details.approvedBy}</span>
          </div>
          <div className="settings-registration-approval-details__item">
            <span className="settings-registration-approval-details__field-label">Approval Date</span>
            <span className="settings-registration-approval-details__field-value">{details.approvalDate}</span>
          </div>
          <div className="settings-registration-approval-details__item">
            <span className="settings-registration-approval-details__field-label">Status</span>
            <span className="settings-registration-approval-details__status-badge">
              <IconApprovedStatus />
              {details.statusLabel}
            </span>
          </div>
        </div>
      </section>
    </FigmaModal>
  );
}
