import { Check } from "lucide-react";
import "../styles/admin-registration-modals.css";

type AdminRegisteredSuccessModalProps = {
  username: string;
  onDone: () => void;
};

export function AdminRegisteredSuccessModal({ username, onDone }: AdminRegisteredSuccessModalProps) {
  return (
    <div className="admin-registration-modal-backdrop" role="presentation">
      <div
        className="admin-registration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-registered-success-title"
      >
        <div className="admin-registration-modal__icon" aria-hidden="true">
          <Check className="h-10 w-10" strokeWidth={2.5} />
        </div>

        <h2 id="admin-registered-success-title" className="admin-registration-modal__title">
          Admin Registered Successfully!
        </h2>

        <div className="admin-registration-modal__notice" aria-label="Registered administrator details">
          <p>Admin account has been created</p>
          <div className="admin-registration-modal__detail-row">
            <span className="admin-registration-modal__detail-label">Username:</span>
            <span className="admin-registration-modal__detail-value">{username}</span>
          </div>
        </div>

        <button type="button" className="admin-registration-modal__btn admin-registration-modal__btn--primary" onClick={onDone}>
          OK
        </button>
      </div>
    </div>
  );
}
