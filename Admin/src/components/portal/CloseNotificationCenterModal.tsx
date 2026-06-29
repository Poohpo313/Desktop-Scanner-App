import FigmaModal from "./FigmaModal";
import "../../styles/close-notification-center-modal.css";

type Props = {
  unreadCount: number;
  readCount: number;
  onCloseCenter: () => void;
  onStay: () => void;
};

function IconCloseNotificationCenter() {
  return (
    <span className="close-notification-center__icon-wrap" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.3" />
        <path d="M11 10V14.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="11" cy="7.25" r="0.75" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function CloseNotificationCenterModal({
  unreadCount,
  readCount,
  onCloseCenter,
  onStay,
}: Props) {
  return (
    <FigmaModal
      className="figma-modal--close-notification-center"
      hideHeader
      hideClose
      onDismiss={onStay}
    >
      <div className="close-notification-center">
        <IconCloseNotificationCenter />

        <h2 className="close-notification-center__title">Close Notification Center</h2>

        <p className="close-notification-center__message">
          You still have unread notifications. Would you like to close the notification center anyway?
        </p>

        <div className="close-notification-center__summary">
          <p className="close-notification-center__summary-label">Notification Summary</p>

          <div className="close-notification-center__summary-row">
            <span className="close-notification-center__summary-left">
              <span className="close-notification-center__dot close-notification-center__dot--unread" />
              <span>Unread Notifications</span>
            </span>
            <strong className="close-notification-center__count close-notification-center__count--unread">
              {unreadCount.toLocaleString()}
            </strong>
          </div>

          <div className="close-notification-center__summary-divider" />

          <div className="close-notification-center__summary-row">
            <span className="close-notification-center__summary-left">
              <span className="close-notification-center__dot close-notification-center__dot--read" />
              <span>Read Notifications</span>
            </span>
            <strong className="close-notification-center__count close-notification-center__count--read">
              {readCount.toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="close-notification-center__actions">
          <button type="button" className="close-notification-center__confirm-btn" onClick={onCloseCenter}>
            Close Center
          </button>
          <button type="button" className="close-notification-center__stay-btn" onClick={onStay}>
            Stay Here
          </button>
        </div>
      </div>
    </FigmaModal>
  );
}
