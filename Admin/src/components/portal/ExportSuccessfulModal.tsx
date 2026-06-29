import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import FigmaModal from "./FigmaModal";
import "../../styles/export-successful-modal.css";

type Props = {
  filename: string;
  fileSizeLabel: string;
  onClose: () => void;
  savePath?: string;
  hideSaveLocation?: boolean;
};

function SuccessCheckIcon() {
  return (
    <span className="export-successful__icon" aria-hidden="true">
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
  );
}

export default function ExportSuccessfulModal({
  filename,
  fileSizeLabel,
  savePath = "",
  onClose,
  hideSaveLocation = false,
}: Props) {
  return (
    <FigmaModal
      className="figma-modal--export-successful"
      hideHeader
      hideClose
      onDismiss={onClose}
    >
      <button type="button" className="export-successful__close" aria-label="Close" onClick={onClose}>
        <img src={closeIcon} alt="" aria-hidden="true" />
      </button>

      <div className="export-successful">
        <SuccessCheckIcon />
        <h2 className="export-successful__title">Export Successful!</h2>
        <p className="export-successful__message">Your document has been exported successfully.</p>

        <div className="export-successful__details">
          <div className="export-successful__details-top">
            <span className="export-successful__filename">{filename}</span>
            <span className="export-successful__size">{fileSizeLabel}</span>
          </div>
          {!hideSaveLocation ? (
            <>
              <p className="export-successful__saved-label">Saved to:</p>
              <p className="export-successful__saved-path">{savePath}</p>
            </>
          ) : null}
        </div>
      </div>
    </FigmaModal>
  );
}
