import { Folder, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { SavedDocumentFileType } from "../../lib/documents";
import type { FileLocationTarget } from "./documentsFileLocation";
import "../../styles/open-file-location-modal.css";

type OpenFileLocationModalProps = {
  target: FileLocationTarget;
  onCancel: () => void;
  onOpen: () => void;
};

function FileTypeBadge({ fileType }: { fileType: SavedDocumentFileType }) {
  return (
    <div
      className={`open-location-modal__file-badge open-location-modal__file-badge--${fileType.toLowerCase()}`}
      aria-hidden="true"
    >
      {fileType}
    </div>
  );
}

export function OpenFileLocationModal({ target, onCancel, onOpen }: OpenFileLocationModalProps) {
  return createPortal(
    <div className="open-location-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="open-location-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-location-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="open-location-modal__header">
          <h2 id="open-location-modal-title" className="open-location-modal__title">
            Open File Location
          </h2>
          <button
            type="button"
            className="open-location-modal__close"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <div className="open-location-modal__body">
          <section className="open-location-modal__section">
            <h3 className="open-location-modal__section-title">Selected File</h3>
            <div className="open-location-modal__card">
              <FileTypeBadge fileType={target.fileType} />
              <p className="open-location-modal__file-name">{target.fileName}</p>
            </div>
          </section>

          <section className="open-location-modal__section">
            <h3 className="open-location-modal__section-title">Current Location</h3>
            <div className="open-location-modal__card open-location-modal__card--path">
              <Folder className="open-location-modal__folder-icon" strokeWidth={1.8} />
              <p className="open-location-modal__path">{target.folderPath}</p>
            </div>
          </section>

          <p className="open-location-modal__note">
            The system will open the folder location of this file on your computer.
          </p>
        </div>

        <footer className="open-location-modal__footer">
          <button type="button" className="open-location-modal__btn open-location-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="open-location-modal__btn open-location-modal__btn--open" onClick={onOpen}>
            Open Location
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
