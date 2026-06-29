import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import { IconUserDetailsKebab } from "../icons/UserDetailsIcons";
import { useNotificationStore } from "../../store/notificationStore";
import {
  DEFAULT_SECURITY_INCIDENT,
  type SecurityIncidentDetails,
} from "../../data/securityIncidentDetails";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/security-incident-details-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
  incident?: SecurityIncidentDetails;
};

function IconPriorityWarning() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5L12.5 12H1.5L7 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M7 5.25V7.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="9.75" r="0.55" fill="currentColor" />
    </svg>
  );
}

function IconActionCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        d="M5.25 8L7 9.75L10.75 6"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconIncidentReport() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5H9.25L11.5 4.75V13.5H4.5V2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.25 2.5V4.75H11.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6.25 7.25H9.75M6.25 9.5H9.75M6.25 11.75H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconBlockDevice() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.25 11.75L11.75 4.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function SecurityIncidentDetailsModal({
  closeTo = "/admin-dashboard-2226-1193",
  onClose,
  incident = DEFAULT_SECURITY_INCIDENT,
}: Props) {
  const push = useNotificationStore((s) => s.push);

  const handleClose = () => {
    onClose?.();
  };

  const handleCreateReport = () => {
    push("Incident report draft created", "success");
  };

  const handleBlockDevice = () => {
    push(`Device ${incident.macAddress} blocked`, "success");
    handleClose();
  };

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="security-incident__close-btn" onClick={handleClose}>
          Close
        </button>
      ) : (
        <Link to={closeTo} className="security-incident__close-btn">
          Close
        </Link>
      )}
      <div className="security-incident__footer-actions">
        <button
          type="button"
          className="figma-btn figma-btn--outline-green security-incident__report-btn"
          onClick={handleCreateReport}
        >
          <IconIncidentReport />
          Create Incident Report
        </button>
        <button
          type="button"
          className="figma-btn figma-btn--danger security-incident__block-btn"
          onClick={handleBlockDevice}
        >
          <IconBlockDevice />
          Block Device
        </button>
      </div>
    </>
  );

  return (
    <FigmaModal
      hideHeader
      className="figma-modal--security-incident"
      footer={footer}
      footerClassName="security-incident__footer-wrap"
    >
      <header className="security-incident__header">
        <h2 id="figma-modal-title" className="security-incident__title">
          Security Incident Details
        </h2>
        <div className="security-incident__header-actions">
          <button type="button" className="security-incident__menu-btn" aria-label="More options">
            <IconUserDetailsKebab />
          </button>
          {onClose ? (
            <button
              type="button"
              className="security-incident__dismiss-btn"
              aria-label="Close"
              onClick={handleClose}
            >
              <img src={closeIcon} alt="" aria-hidden="true" />
            </button>
          ) : (
            <Link to={closeTo} className="security-incident__dismiss-btn" aria-label="Close">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Link>
          )}
        </div>
      </header>

      <div className="security-incident__badges">
        <span className={`security-incident__priority security-incident__priority--${incident.priority}`}>
          <IconPriorityWarning />
          {incident.priorityLabel}
        </span>
        <span className="security-incident__id-badge">{incident.incidentId}</span>
      </div>

      <section className="security-incident__summary-card" aria-label="Incident summary">
        <h3 className="security-incident__summary-title">{incident.title}</h3>
        <dl className="security-incident__meta-grid">
          <div className="security-incident__meta-item">
            <dt>MAC ADDRESS</dt>
            <dd>{incident.macAddress}</dd>
          </div>
          <div className="security-incident__meta-item">
            <dt>IP ADDRESS</dt>
            <dd>{incident.ipAddress}</dd>
          </div>
          <div className="security-incident__meta-item security-incident__meta-item--wide">
            <dt>DETECTION TIME</dt>
            <dd>{incident.detectionTime}</dd>
          </div>
        </dl>
      </section>

      <div className="security-incident__details-grid">
        <section className="security-incident__detail-block">
          <h4 className="security-incident__detail-label">DESCRIPTION</h4>
          <div className="security-incident__description-box">{incident.description}</div>
        </section>

        <section className="security-incident__detail-block">
          <h4 className="security-incident__detail-label">ACTIONS TAKEN</h4>
          <ul className="security-incident__actions-list">
            {incident.actionsTaken.map((action) => (
              <li key={action}>
                <IconActionCheck />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </FigmaModal>
  );
}
