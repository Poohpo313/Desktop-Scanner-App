import FigmaModal from "./FigmaModal";
import "../../styles/dismiss-all-notifications-modal.css";

type Props = {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
};

function IconDismissAllNotifications() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M8.25 3.5H13.75L14.75 5.25H17.5V6.25H4.5V5.25H7.25L8.25 3.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M6 6.25V15.75C6 16.44 6.56 17 7.25 17H14.75C15.44 17 16 16.44 16 15.75V6.25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.25 8.75V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12.75 8.75V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.75 8.25H19.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.75 11H18.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.75 13.75H19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function DismissAllNotificationsModal({ count, onConfirm, onCancel }: Props) {
  return (
    <FigmaModal className="figma-modal--dismiss-all-notifications" hideHeader hideClose onDismiss={onCancel}>
      <div className="dismiss-all-notifications">
        <span className="dismiss-all-notifications__icon-wrap" aria-hidden="true">
          <IconDismissAllNotifications />
        </span>

        <h2 className="dismiss-all-notifications__title">Dismiss All Notifications?</h2>

        <p className="dismiss-all-notifications__message">
          This will mark all <strong>{count.toLocaleString()}</strong> notifications as read and remove
          them from your active feed. This action cannot be undone.
        </p>

        <div className="dismiss-all-notifications__actions">
          <button type="button" className="dismiss-all-notifications__confirm-btn" onClick={onConfirm}>
            Dismiss All
          </button>
          <button type="button" className="dismiss-all-notifications__cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </FigmaModal>
  );
}
