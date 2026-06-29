import { RotateCcw } from "lucide-react";
import { createPortal } from "react-dom";
import type { DeletedDocument } from "../../lib/deletedDocuments";
import "../../styles/restore-document-modal.css";

type RestoreDocumentModalProps = {
  deletedDocument: DeletedDocument;
  onCancel: () => void;
  onConfirm: () => void;
};

function FileTypeBadge({ fileType }: { fileType: DeletedDocument["fileType"] }) {
  return (
    <div
      className={`restore-doc-modal__file-badge restore-doc-modal__file-badge--${fileType.toLowerCase()}`}
      aria-hidden="true"
    >
      {fileType}
    </div>
  );
}

export function RestoreDocumentModal({ deletedDocument, onCancel, onConfirm }: RestoreDocumentModalProps) {
  return createPortal(
    <div className="restore-doc-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="restore-doc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-doc-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="restore-doc-modal__icon-wrap" aria-hidden="true">
          <RotateCcw className="restore-doc-modal__icon" strokeWidth={2} />
        </div>

        <h2 id="restore-doc-modal-title" className="restore-doc-modal__title">
          Restore Document?
        </h2>
        <p className="restore-doc-modal__subtitle">Are you sure you want to restore this document?</p>

        <div className="restore-doc-modal__card">
          <FileTypeBadge fileType={deletedDocument.fileType} />
          <div className="restore-doc-modal__card-body">
            <p className="restore-doc-modal__file-name">{deletedDocument.fileName}</p>
            <p className="restore-doc-modal__folder-label">Original folder</p>
            <p className="restore-doc-modal__folder-path">{deletedDocument.originalFolder}</p>
          </div>
        </div>

        <p className="restore-doc-modal__note">
          This document will be removed from the Recycle Bin and returned to its original folder.
        </p>

        <div className="restore-doc-modal__actions">
          <button type="button" className="restore-doc-modal__btn restore-doc-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="restore-doc-modal__btn restore-doc-modal__btn--confirm"
            onClick={onConfirm}
          >
            Restore Document
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
