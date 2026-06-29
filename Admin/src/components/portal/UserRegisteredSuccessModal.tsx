import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import type { RegisteredUserSummary } from "../../utils/registerUserDisplay";
import "../../styles/user-registered-success-modal.css";

type Props = {
  summary: RegisteredUserSummary;
  onDone: () => void;
};

function SuccessCheckIcon() {
  return (
    <span className="user-activated-success__icon" aria-hidden="true">
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

export default function UserRegisteredSuccessModal({ summary, onDone }: Props) {
  return (
    <FigmaModal className="figma-modal--user-activated-success" hideHeader hideClose success>
      <button type="button" className="user-activated-success__close" aria-label="Close" onClick={onDone}>
        <img src={closeIcon} alt="" aria-hidden="true" />
      </button>

      <div className="user-activated-success">
        <SuccessCheckIcon />
        <h2 className="user-activated-success__title">User Registered Successfully</h2>

        <div className="user-activated-success__details" aria-label="Registered user details">
          <div className="user-activated-success__detail-row">
            <span className="user-activated-success__detail-label">Username:</span>
            <span className="user-activated-success__detail-value">{summary.username}</span>
          </div>
          <div className="user-activated-success__detail-row">
            <span className="user-activated-success__detail-label">Serial key:</span>
            <span className="user-activated-success__detail-value">{summary.licenseKey}</span>
          </div>
        </div>

        <button type="button" className="user-activated-success__ok-btn" onClick={onDone}>
          OK
        </button>
      </div>
    </FigmaModal>
  );
}
