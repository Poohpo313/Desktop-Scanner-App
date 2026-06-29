import Modal from "./Modal";
import { formatExportFileSizeLabel } from "../utils/exportFormat";
import "../styles/export-keys-success-modal.css";

type Props = {
  open: boolean;
  filename: string;
  sizeBytes: number;
  onClose: () => void;
};

export default function ExportKeysSuccessModal({ open, filename, sizeBytes, onClose }: Props) {
  if (!open) return null;

  return (
    <Modal open={open} title="" hideHeader onClose={onClose}>
      <div className="export-keys-success">
        <span className="export-keys-success__icon" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path
              d="M8.5 17.25L14.25 23L25.5 11.75"
              stroke="currentColor"
              strokeWidth="3.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2>Export Successful!</h2>
        <p>Your document has been exported successfully.</p>
        <div className="export-keys-success__details">
          <div className="export-keys-success__details-top">
            <span>{filename}</span>
            <strong>{formatExportFileSizeLabel(sizeBytes)}</strong>
          </div>
        </div>
        <button type="button" className="export-keys-success__done" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
