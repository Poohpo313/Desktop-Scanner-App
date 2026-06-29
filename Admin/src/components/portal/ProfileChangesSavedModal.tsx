import FigmaModal from "./FigmaModal";
import "../../styles/settings-profile-changes-saved-modal.css";

type Props = {
  onClose: () => void;
};

function SuccessCheckIcon() {
  return (
    <span className="profile-changes-saved__icon" aria-hidden="true">
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

export default function ProfileChangesSavedModal({ onClose }: Props) {
  return (
    <FigmaModal className="figma-modal--profile-changes-saved" hideHeader hideClose success>
      <div className="profile-changes-saved">
        <SuccessCheckIcon />
        <h2 className="profile-changes-saved__title">Changes Saved Successfully!</h2>
        <button type="button" className="profile-changes-saved__ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </FigmaModal>
  );
}
