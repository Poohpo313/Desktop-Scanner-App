import { useState } from "react";
import Modal from "./Modal";
import {
  DEFAULT_KEY_EXPORT_FIELDS,
  KEY_EXPORT_FIELD_LABELS,
  type KeyExportFieldId,
  type KeyExportFieldSelection,
  type KeyExportOptions,
} from "../data/exportKeysList";
import "../styles/export-keys-modal.css";

type Props = {
  open: boolean;
  exporting?: boolean;
  onClose: () => void;
  onExport: (options: KeyExportOptions) => void | Promise<void>;
};

const LEFT_FIELDS: KeyExportFieldId[] = ["serialId", "assignedUser", "generatedAt", "company"];
const RIGHT_FIELDS: KeyExportFieldId[] = ["serialKey", "status", "expiresAt", "department"];

export default function ExportKeysModal({ open, exporting = false, onClose, onExport }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fields, setFields] = useState<KeyExportFieldSelection>({ ...DEFAULT_KEY_EXPORT_FIELDS });

  if (!open) return null;

  const toggleField = (fieldId: KeyExportFieldId) => {
    setFields((current) => ({ ...current, [fieldId]: !current[fieldId] }));
  };

  const hasSelectedField = [...LEFT_FIELDS, ...RIGHT_FIELDS].some((fieldId) => fields[fieldId]);

  const renderCheckbox = (fieldId: KeyExportFieldId) => (
    <label key={fieldId} className="export-keys-modal__checkbox">
      <input
        type="checkbox"
        checked={fields[fieldId]}
        onChange={() => toggleField(fieldId)}
        disabled={exporting}
      />
      <span className="export-keys-modal__checkbox-box" aria-hidden="true">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{KEY_EXPORT_FIELD_LABELS[fieldId]}</span>
    </label>
  );

  return (
    <Modal open={open} title="Export Serial Data" onClose={onClose}>
      <div className="export-keys-modal">
        <p className="export-keys-modal__subtitle">Configure your CSV export parameters below.</p>

        <section className="export-keys-modal__section">
          <h3>Date Range Selection</h3>
          <div className="export-keys-modal__date-grid">
            <label>
              <span>Start Date</span>
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={exporting}
              />
            </label>
            <label>
              <span>End Date</span>
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={exporting}
              />
            </label>
          </div>
        </section>

        <section className="export-keys-modal__section">
          <h3>Data Fields to Include</h3>
          <div className="export-keys-modal__fields">
            <div>{LEFT_FIELDS.map(renderCheckbox)}</div>
            <div>{RIGHT_FIELDS.map(renderCheckbox)}</div>
          </div>
        </section>

        <p className="export-keys-modal__note">Your report will include all keys matching the selected criteria.</p>

        <div className="export-keys-modal__actions">
          <button type="button" className="export-keys-modal__cancel" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button
            type="button"
            className="export-keys-modal__submit"
            disabled={exporting || !hasSelectedField}
            onClick={() => void onExport({ startDate, endDate, fields })}
          >
            {exporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
