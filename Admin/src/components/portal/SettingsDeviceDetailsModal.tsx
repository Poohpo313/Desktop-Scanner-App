import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import scannerImage from "../../icons/settings-device-details-scanner.png";
import lastSyncIcon from "../../icons/settings-device-details-last-sync-icon.png";
import { SETTINGS_DEVICE_DETAILS_SCN_102 } from "../../data/demoSettingsDeviceDetails";
import "../../styles/settings-device-details-modal.css";

type Props = {
  onClose: () => void;
};

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 6.25V10" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="7" cy="4.35" r="0.75" fill="currentColor" />
    </svg>
  );
}

function IconShieldHealth() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.75L10.75 3.25V6.5C10.75 8.65 9.2 10.45 7 11.25C4.8 10.45 3.25 8.65 3.25 6.5V3.25L7 1.75Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 6.75L6.25 8.25L9.25 5"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWifi() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.75C5.15 4.1 10.85 4.1 13.5 6.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M4.75 9C6.35 7.4 9.65 7.4 11.25 9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M7.25 11.25C7.55 10.95 8.45 10.95 8.75 11.25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="12.75" r="0.75" fill="currentColor" />
    </svg>
  );
}

function IconSync() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.25" y="3.25" width="9.5" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.15" />
      <path
        d="M5.75 8.25L7.25 9.75L10.25 6.75"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRegistration() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="4.25" height="4.25" rx="0.75" stroke="currentColor" strokeWidth="1.1" />
      <rect x="8.75" y="3" width="4.25" height="4.25" rx="0.75" stroke="currentColor" strokeWidth="1.1" />
      <rect x="3" y="8.75" width="4.25" height="4.25" rx="0.75" stroke="currentColor" strokeWidth="1.1" />
      <rect x="8.75" y="8.75" width="4.25" height="4.25" rx="0.75" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function IconStatusCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" fill="#00a76a" />
      <path
        d="M4.5 7L6.25 8.75L9.5 5.5"
        stroke="#ffffff"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function healthIcon(id: string) {
  if (id === "connection") return <IconWifi />;
  if (id === "sync") return <IconSync />;
  return <IconRegistration />;
}

export default function SettingsDeviceDetailsModal({ onClose }: Props) {
  const device = SETTINGS_DEVICE_DETAILS_SCN_102;

  const footer = (
    <button type="button" className="settings-device-details__close-btn" onClick={onClose}>
      Close
    </button>
  );

  return (
    <FigmaModal
      className="figma-modal--settings-device-details"
      hideHeader
      hideClose
      onDismiss={onClose}
      footer={footer}
      footerClassName="settings-device-details__footer-wrap"
    >
      <div className="settings-device-details__header">
        <div className="settings-device-details__title-row">
          <h2 className="settings-device-details__title">Device Details</h2>
          <span className="settings-device-details__badge settings-device-details__badge--online">
            <span className="settings-device-details__online-dot" aria-hidden="true" />
            {device.statusLabel}
          </span>
          <span className="settings-device-details__badge settings-device-details__badge--model">
            {device.modelId}
          </span>
        </div>
        <button type="button" className="settings-device-details__close-icon" aria-label="Close" onClick={onClose}>
          <img src={closeIcon} alt="" aria-hidden="true" />
        </button>
      </div>

      <div className="settings-device-details__hero">
        <img className="settings-device-details__hero-image" src={scannerImage} alt="" />
        <span className="settings-device-details__hero-tag">{device.deviceName}</span>
      </div>

      <section className="settings-device-details__section">
        <div className="settings-device-details__section-head">
          <span className="settings-device-details__section-icon" aria-hidden="true">
            <IconInfo />
          </span>
          <h3 className="settings-device-details__section-title">Device Information</h3>
        </div>

        <div className="settings-device-details__info-grid">
          <div className="settings-device-details__info-item">
            <span className="settings-device-details__info-label">Device Name</span>
            <span className="settings-device-details__info-value">{device.deviceName}</span>
          </div>
          <div className="settings-device-details__info-item">
            <span className="settings-device-details__info-label">Device Type</span>
            <span className="settings-device-details__info-value">{device.deviceType}</span>
          </div>
          <div className="settings-device-details__info-item">
            <span className="settings-device-details__info-label">Serial Number</span>
            <span className="settings-device-details__info-value">{device.serialNumber}</span>
          </div>
          <div className="settings-device-details__info-item">
            <span className="settings-device-details__info-label">Department</span>
            <span className="settings-device-details__info-value">{device.department}</span>
          </div>
          <div className="settings-device-details__info-item">
            <span className="settings-device-details__info-label">Location</span>
            <span className="settings-device-details__info-value">{device.location}</span>
          </div>
          <div className="settings-device-details__info-item">
            <span className="settings-device-details__info-label">Registration Date</span>
            <span className="settings-device-details__info-value">{device.registrationDate}</span>
          </div>
        </div>

        <div className="settings-device-details__sync-row">
          <div className="settings-device-details__sync-copy">
            <span className="settings-device-details__info-label">Last Sync</span>
            <div className="settings-device-details__sync-value-row">
              <img
                src={lastSyncIcon}
                alt=""
                className="settings-device-details__sync-icon-img"
                aria-hidden="true"
              />
              <span className="settings-device-details__info-value">{device.lastSync}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-device-details__health">
        <div className="settings-device-details__section-head">
          <span className="settings-device-details__section-icon settings-device-details__section-icon--health" aria-hidden="true">
            <IconShieldHealth />
          </span>
          <h3 className="settings-device-details__section-title">Device Health</h3>
        </div>

        <div className="settings-device-details__health-list">
          {device.health.map((item) => (
            <div key={item.id} className="settings-device-details__health-row">
              <span className="settings-device-details__health-leading" aria-hidden="true">
                {healthIcon(item.id)}
              </span>
              <span className="settings-device-details__health-label">{item.label}</span>
              <span className="settings-device-details__health-status">
                <IconStatusCheck />
                <span>{item.value}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </FigmaModal>
  );
}
