import { useState } from "react";
import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import {
  DEFAULT_KEY_EXPORT_FIELDS,
  KEY_EXPORT_FIELD_LABELS,
  type KeyExportFieldId,
  type KeyExportFieldSelection,
  type KeyExportOptions,
} from "../../data/exportKeysList";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import calendarIcon from "../../icons/generate-keys-expiry-calendar.svg";
import "../../styles/export-license-data-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
  onExport?: (options: KeyExportOptions) => void | Promise<void>;
  exporting?: boolean;
};

const LEFT_FIELDS: KeyExportFieldId[] = ["keyId", "assignedUser", "dateGenerated"];
const RIGHT_FIELDS: KeyExportFieldId[] = ["licenseKey", "status"];

function IconExportReport() {
  return (
    <svg className="export-license__export-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.33333V10M8 1.33333L5.33333 4M8 1.33333L10.6667 4M2.66667 10V13.3333C2.66667 13.7 2.79667 14.0139 3.05667 14.275C3.31667 14.5361 3.63056 14.6667 4 14.6667H12C12.3694 14.6667 12.6833 14.5361 12.9433 14.275C13.2033 14.0139 13.3333 13.7 13.3333 13.3333V10"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg className="export-license__info-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7V11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export default function ExportLicenseDataModal({
  closeTo = "/license-key-management-2226-2536",
  onClose,
  onExport,
  exporting = false,
}: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fields, setFields] = useState<KeyExportFieldSelection>({ ...DEFAULT_KEY_EXPORT_FIELDS });

  const toggleField = (fieldId: KeyExportFieldId) => {
    setFields((current) => ({ ...current, [fieldId]: !current[fieldId] }));
  };

  const handleExport = () => {
    if (exporting) return;
    void onExport?.({
      startDate,
      endDate,
      fields,
    });
  };

  const hasSelectedField = [...LEFT_FIELDS, ...RIGHT_FIELDS].some((fieldId) => fields[fieldId]);

  const renderCheckbox = (fieldId: KeyExportFieldId) => (
    <label key={fieldId} className="export-license__checkbox">
      <input
        type="checkbox"
        checked={fields[fieldId]}
        onChange={() => toggleField(fieldId)}
        disabled={exporting}
      />
      <span className="export-license__checkbox-box" aria-hidden="true">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="export-license__checkbox-label">{KEY_EXPORT_FIELD_LABELS[fieldId]}</span>
    </label>
  );

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="figma-btn figma-btn--ghost" onClick={onClose} disabled={exporting}>
          Cancel
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn figma-btn--ghost">
          Cancel
        </Link>
      )}
      {onExport ? (
        <button
          type="button"
          className="figma-btn figma-btn--primary export-license__export-btn"
          onClick={handleExport}
          disabled={exporting || !hasSelectedField}
          aria-busy={exporting}
        >
          <IconExportReport />
          {exporting ? "Exporting..." : "Export Report"}
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn figma-btn--primary export-license__export-btn">
          <IconExportReport />
          Export Report
        </Link>
      )}
    </>
  );

  return (
    <FigmaModal
      className="figma-modal--export-license"
      title="Export Serial Data"
      subtitle="Configure your CSV export parameters below."
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="export-license__footer-wrap"
    >
      <section className="export-license__section">
        <h3 className="export-license__section-label">Date Range Selection</h3>
        <div className="export-license__date-grid">
          <label className="export-license__field">
            <span className="export-license__field-label">Start Date</span>
            <span className="export-license__input-wrap">
              <input
                type="text"
                className="export-license__input"
                placeholder="MM/DD/YYYY"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={exporting}
              />
              <img src={calendarIcon} alt="" aria-hidden="true" className="export-license__calendar-icon" />
            </span>
          </label>
          <label className="export-license__field">
            <span className="export-license__field-label">End Date</span>
            <span className="export-license__input-wrap">
              <input
                type="text"
                className="export-license__input"
                placeholder="MM/DD/YYYY"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={exporting}
              />
              <img src={calendarIcon} alt="" aria-hidden="true" className="export-license__calendar-icon" />
            </span>
          </label>
        </div>
      </section>

      <section className="export-license__section">
        <h3 className="export-license__section-label">Data Fields to Include</h3>
        <div className="export-license__fields-panel">
          <div className="export-license__fields-column">{LEFT_FIELDS.map(renderCheckbox)}</div>
          <div className="export-license__fields-column">{RIGHT_FIELDS.map(renderCheckbox)}</div>
        </div>
      </section>

      <div className="export-license__info" role="note">
        <IconInfo />
        <p>Your report will include all keys matching the selected criteria.</p>
      </div>
    </FigmaModal>
  );
}
