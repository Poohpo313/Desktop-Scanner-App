import FigmaModal from "./FigmaModal";
import scannerConfigIcon from "../../icons/settings-scanner-configuration-update-details-icon.png";
import fifteenMinutesIcon from "../../icons/settings-scanner-config-15-minutes-icon.png";
import {
  SETTINGS_SCANNER_CONFIGURATION_UPDATE_DETAILS,
  type ScannerConfigurationUpdateChangeRow,
} from "../../data/demoSettingsScannerConfigurationUpdateDetails";
import "../../styles/settings-scanner-configuration-update-details-modal.css";

type Props = {
  onClose: () => void;
};

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

function UpdatedValueBadge({ row }: { row: ScannerConfigurationUpdateChangeRow }) {
  if (row.badgeStyle === "interval") {
    return (
      <span className="settings-scanner-config-update__badge settings-scanner-config-update__badge--interval">
        <img
          src={fifteenMinutesIcon}
          alt=""
          className="settings-scanner-config-update__interval-icon"
          aria-hidden="true"
        />
        {row.updatedValue}
      </span>
    );
  }

  return (
    <span className="settings-scanner-config-update__badge-wrap">
      <span className="settings-scanner-config-update__badge-arrow" aria-hidden="true">
        →
      </span>
      <span className="settings-scanner-config-update__badge settings-scanner-config-update__badge--enabled">
        {row.updatedValue}
      </span>
    </span>
  );
}

export default function SettingsScannerConfigurationUpdateDetailsModal({ onClose }: Props) {
  const details = SETTINGS_SCANNER_CONFIGURATION_UPDATE_DETAILS;

  const footer = (
    <button type="button" className="settings-scanner-config-update__close-btn" onClick={onClose}>
      Close
    </button>
  );

  return (
    <FigmaModal
      className="figma-modal--settings-scanner-config-update"
      hideHeader
      hideClose
      onDismiss={onClose}
      footer={footer}
      footerClassName="settings-scanner-config-update__footer-wrap"
    >
      <div className="settings-scanner-config-update__header">
        <div className="settings-scanner-config-update__header-copy">
          <span className="settings-scanner-config-update__header-icon" aria-hidden="true">
            <img
              src={scannerConfigIcon}
              alt=""
              className="settings-scanner-config-update__header-icon-img"
            />
          </span>
          <div>
            <h2 className="settings-scanner-config-update__title">Scanner Configuration Update Details</h2>
            <p className="settings-scanner-config-update__subtitle">
              Review the configuration settings modified for the scanner.
            </p>
          </div>
        </div>
      </div>

      <div className="settings-scanner-config-update__meta">
        <div className="settings-scanner-config-update__meta-item">
          <span className="settings-scanner-config-update__meta-label">Updated By</span>
          <div className="settings-scanner-config-update__meta-value settings-scanner-config-update__meta-value--user">
            <span className="settings-scanner-config-update__avatar" aria-hidden="true">
              G
            </span>
            <span>{details.updatedBy}</span>
          </div>
        </div>
        <div className="settings-scanner-config-update__meta-item">
          <span className="settings-scanner-config-update__meta-label">Updated On</span>
          <div className="settings-scanner-config-update__meta-value settings-scanner-config-update__meta-value--date">
            <span className="settings-scanner-config-update__meta-inline-icon" aria-hidden="true">
              <IconCalendar />
            </span>
            <span>{details.updatedOn}</span>
          </div>
        </div>
      </div>

      <div className="settings-scanner-config-update__table-wrap">
        <table className="settings-scanner-config-update__table">
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
                <td>
                  <span
                    className={
                      row.previousTone === "disabled"
                        ? "settings-scanner-config-update__previous-disabled"
                        : undefined
                    }
                  >
                    {row.previousValue}
                  </span>
                </td>
                <td>
                  <UpdatedValueBadge row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FigmaModal>
  );
}
