import { useState } from "react";
import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/notify-super-admin-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
  onSend?: (note: string) => void;
  deviceName?: string;
};

function IconBell() {
  return (
    <svg width="28" height="28" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.2 9.05V6.45A2.8 2.8 0 0 1 10.8 6.45V9.05"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3.1" y="8.9" width="9.8" height="1.65" rx="0.825" fill="currentColor" />
      <path d="M6.75 10.55A1.25 1.25 0 0 0 9.25 10.55Z" fill="currentColor" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.75 8.75L13.25 3.25L9.75 13.25L7.75 9.25L2.75 8.75Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M7.75 9.25L9.75 13.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NotifySuperAdminModal({
  closeTo = "/device-management",
  onClose,
  onSend,
  deviceName = "",
}: Props) {
  const [note, setNote] = useState("");

  const handleSend = () => {
    onSend?.(note);
    if (onClose) {
      onClose();
    }
  };

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="notify-admin__cancel-btn" onClick={onClose}>
          Cancel
        </button>
      ) : (
        <Link to={closeTo} className="notify-admin__cancel-btn">
          Cancel
        </Link>
      )}
      {onClose ? (
        <button type="button" className="figma-btn figma-btn--primary notify-admin__send-btn" onClick={handleSend}>
          <IconSend />
          Send Notification
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn figma-btn--primary notify-admin__send-btn">
          <IconSend />
          Send Notification
        </Link>
      )}
    </>
  );

  const closeControl = onClose ? (
    <button type="button" className="notify-admin__close" aria-label="Close" onClick={onClose}>
      <img src={closeIcon} alt="" aria-hidden="true" />
    </button>
  ) : (
    <Link to={closeTo} className="notify-admin__close" aria-label="Close">
      <img src={closeIcon} alt="" aria-hidden="true" />
    </Link>
  );

  return (
    <FigmaModal
      className="figma-modal--notify-admin"
      hideHeader
      hideClose
      onDismiss={onClose}
      footer={footer}
      footerClassName="notify-admin__footer-wrap"
    >
      {closeControl}

      <div className="notify-admin__icon-wrap" aria-hidden="true">
        <IconBell />
      </div>

      <h2 id="figma-modal-title" className="notify-admin__title">
        Notify Admin
      </h2>

      <p className="notify-admin__question">
        Report an issue with <strong>{deviceName}</strong> to the Super Admin?
      </p>

      <label className="notify-admin__field">
        <span className="notify-admin__label">Add a note (optional)</span>
        <textarea
          className="notify-admin__textarea"
          rows={4}
          placeholder="Describe the technical discrepancy or issue observed..."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
    </FigmaModal>
  );
}
