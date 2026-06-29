import { AlertTriangle } from "lucide-react";
import "../styles/admin-registration-modals.css";

type DeleteAdministratorConfirmModalProps = {
  adminName: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting?: boolean;
};

export function DeleteAdministratorConfirmModal({
  adminName,
  onCancel,
  onConfirm,
  deleting = false,
}: DeleteAdministratorConfirmModalProps) {
  return (
    <div className="admin-registration-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-registration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-administrator-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-registration-modal__icon admin-registration-modal__icon--warning" aria-hidden="true">
          <AlertTriangle className="h-8 w-8" strokeWidth={2} />
        </div>

        <h2 id="delete-administrator-title" className="admin-registration-modal__title">
          Delete Administrator Profile?
        </h2>

        <div className="admin-registration-modal__notice">
          <p>Are you sure you want to delete this administrator profile?</p>
          <p>
            This action will move <strong>{adminName}</strong> to the Recycle Bin.
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
