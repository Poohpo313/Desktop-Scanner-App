import FigmaModal from "./FigmaModal";
import "../../styles/notifications-dismissed-modal.css";

type Props = {
  onDone: () => void;
};

function IconNotificationsDismissed() {
  return (
    <span className="notifications-dismissed__icon-wrap" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.5L8 15.5L13.5 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 12.5L13 15.5L19 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function NotificationsDismissedModal({ onDone }: Props) {
  return (
    <FigmaModal className="figma-modal--notifications-dismissed" hideHeader hideClose onDismiss={onDone}>
      <div className="notifications-dismissed">
        <IconNotificationsDismissed />

        <h2 className="notifications-dismissed__title">Notifications Dismissed</h2>

        <p className="notifications-dismissed__message">
          All notifications have been successfully dismissed. Your administrative feed is now up to date.
        </p>

        <button type="button" className="notifications-dismissed__done-btn" onClick={onDone}>
          Done
        </button>
      </div>
    </FigmaModal>
  );
}
