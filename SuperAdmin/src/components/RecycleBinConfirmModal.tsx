import { AlertTriangle } from "lucide-react";
import "../styles/admin-registration-modals.css";

type RecycleBinConfirmModalProps = {
  title: string;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting?: boolean;
};

export function RecycleBinConfirmModal({
  title,
  itemName,
  onCancel,
  onConfirm,
  deleting = false,
}: RecycleBinConfirmModalProps) {
  return (
    <div className="admin-registration-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-registration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recycle-bin-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-registration-modal__icon admin-registration-modal__icon--warning" aria-hidden="true">
          <AlertTriangle className="h-8 w-8" strokeWidth={2} />
        </div>

        <h2 id="recycle-bin-confirm-title" className="admin-registration-modal__title">
          {title}
        </h2>

        <div className="admin-registration-modal__notice">
          <p>Are you sure you want to delete this profile?</p>
          <p>
            This action will move <strong>{itemName}</strong> to the Recycle Bin.
          </p>
        </div>

        <div className="admin-registration-modal__actions admin-registration-modal__actions--split">
          <button type="button" className="admin-registration-modal__btn admin-registration-modal__btn--cancel" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className="admin-registration-modal__btn admin-registration-modal__btn--danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
