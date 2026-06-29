import FigmaModal from "./FigmaModal";
import { SETTINGS_DEVICE_UPDATE_DETAILS } from "../../data/demoSettingsDeviceUpdateDetails";
import "../../styles/settings-device-update-details-modal.css";

type Props = {
  onClose: () => void;
};

function IconChangesMade() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.25" y="3.25" width="7.5" height="7.5" rx="1.25" stroke="currentColor" strokeWidth="1.1" />
      <rect x="4.25" y="1.75" width="7.5" height="7.5" rx="1.25" fill="#e6f7ef" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.25" y="3.25" width="9.5" height="8.25" rx="1.25" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2.25 5.75H11.75" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.75 2.25V4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M9.25 2.25V4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="4.75" r="2.1" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M3.25 11.25C3.85 9.35 5.25 8.25 7 8.25C8.75 8.25 10.15 9.35 10.75 11.25"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SettingsDeviceUpdateDetailsModal({ onClose }: Props) {
  const details = SETTINGS_DEVICE_UPDATE_DETAILS;

  const footer = (
    <button type="button" className="settings-device-update-details__close-btn" onClick={onClose}>
      Close
    </button>
  );

  return (
    <FigmaModal
      className="figma-modal--settings-device-update-details"
      title="Device Information Update Details"
      subtitle="Review the information modified for the selected scanner device."
      hideClose
      onDismiss={onClose}
      footer={footer}
      footerClassName="settings-device-update-details__footer-wrap"
    >
      <div className="settings-device-update-details__section-head">
        <span className="settings-device-update-details__section-icon" aria-hidden="true">
          <IconChangesMade />
        </span>
        <h3 className="settings-device-update-details__section-title">Changes Made</h3>
      </div>

      <div className="settings-device-update-details__table-wrap">
        <table className="settings-device-update-details__table">
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Previous Value</th>
              <th scope="col">Updated Value</th>
            </tr>
          </thead>
          <tbody>
            {details.changes.map((row) => (
              <tr key={row.field}>
                <td>{row.field}</td>
                <td>{row.previousValue}</td>
                <td>
                  <span className="settings-device-update-details__updated-value">
                    <span aria-hidden="true">→</span> {row.updatedValue}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="settings-device-update-details__meta">
        <div className="settings-device-update-details__meta-item">
          <span className="settings-device-update-details__meta-icon" aria-hidden="true">
            <IconCalendar />
          </span>
          <div className="settings-device-update-details__meta-copy">
            <span className="settings-device-update-details__meta-label">Updated On</span>
            <span className="settings-device-update-details__meta-value">{details.updatedOn}</span>
          </div>
        </div>
        <div className="settings-device-update-details__meta-item">
          <span className="settings-device-update-details__meta-icon" aria-hidden="true">
            <IconUser />
          </span>
          <div className="settings-device-update-details__meta-copy">
            <span className="settings-device-update-details__meta-label">Updated By</span>
            <span className="settings-device-update-details__meta-value">{details.updatedBy}</span>
          </div>
        </div>
      </div>
    </FigmaModal>
  );
}
