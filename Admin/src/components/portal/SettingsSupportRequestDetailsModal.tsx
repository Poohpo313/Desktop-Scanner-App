import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import connectivityIcons from "../../icons/settings-support-request-connectivity-icons.png";
import { SETTINGS_SUPPORT_REQUEST_DETAILS } from "../../data/demoSettingsSupportRequestDetails";
import "../../styles/settings-support-request-details-modal.css";

type Props = {
  onClose: () => void;
};

function IconCategory() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5.25" y="2.25" width="3.5" height="3.5" rx="0.75" stroke="currentColor" strokeWidth="1.1" />
      <rect x="2.25" y="8.25" width="3.5" height="3.5" rx="0.75" stroke="currentColor" strokeWidth="1.1" />
      <rect x="8.25" y="8.25" width="3.5" height="3.5" rx="0.75" stroke="currentColor" strokeWidth="1.1" />
      <path d="M7 5.75V8.25M4 8.25H5.25M8.75 8.25H10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconIssueDescription() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.25" y="2.25" width="7.5" height="9.5" rx="1.1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.25 5H8.75M5.25 7H8.25M5.25 9H7.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function SettingsSupportRequestDetailsModal({ onClose }: Props) {
  const details = SETTINGS_SUPPORT_REQUEST_DETAILS;

  const footer = (
    <button type="button" className="settings-support-request-details__close-btn" onClick={onClose}>
      Close
    </button>
  );

  return (
    <FigmaModal
      className="figma-modal--settings-support-request-details"
      title="Support Request Details"
      subtitle="Review the support request submitted by the administrator."
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="settings-support-request-details__footer-wrap"
    >
      <div className="settings-support-request-details__summary">
        <div className="settings-support-request-details__summary-item">
          <span className="settings-support-request-details__summary-label">Ticket ID</span>
          <span className="settings-support-request-details__summary-value">{details.ticketId}</span>
        </div>
        <div className="settings-support-request-details__summary-item">
          <span className="settings-support-request-details__summary-label">Current Status</span>
          <span className="settings-support-request-details__status-badge settings-support-request-details__status-badge--review">
            <span className="settings-support-request-details__status-dot" aria-hidden="true" />
            {details.statusLabel}
          </span>
        </div>
        <div className="settings-support-request-details__summary-item">
          <span className="settings-support-request-details__summary-label">Priority</span>
          <span className="settings-support-request-details__status-badge settings-support-request-details__status-badge--priority">
            <span className="settings-support-request-details__priority-dot" aria-hidden="true" />
            {details.priorityLabel}
          </span>
        </div>
        <div className="settings-support-request-details__summary-item">
          <span className="settings-support-request-details__summary-label">Submitted Date</span>
          <span className="settings-support-request-details__summary-value">{details.submittedDate}</span>
        </div>
      </div>

      <section className="settings-support-request-details__section">
        <div className="settings-support-request-details__section-head">
          <span className="settings-support-request-details__section-icon" aria-hidden="true">
            <IconCategory />
          </span>
          <h3 className="settings-support-request-details__section-title">Category</h3>
        </div>
        <p className="settings-support-request-details__section-copy">{details.category}</p>
      </section>

      <section className="settings-support-request-details__section">
        <div className="settings-support-request-details__section-head">
          <span className="settings-support-request-details__section-icon" aria-hidden="true">
            <IconIssueDescription />
          </span>
          <h3 className="settings-support-request-details__section-title">Issue Description</h3>
        </div>
        <div className="settings-support-request-details__description-box">
          <p>&ldquo;{details.issueDescription}&rdquo;</p>
          <div className="settings-support-request-details__graphic-panel" aria-hidden="true">
            <img
              src={connectivityIcons}
              alt=""
              className="settings-support-request-details__connectivity-icons"
            />
          </div>
        </div>
      </section>
    </FigmaModal>
  );
}
