import FigmaModal from "./FigmaModal";
import { IconUserPlus } from "../icons/AdminIcons";
import type { RegisterUserFormData } from "./RegisterUserModal";
import { getRegisterUserEmail, getRegisterUserFullName, getRegisterReviewNoticeMessage, REGISTER_USER_ROLE_LABELS } from "../../utils/registerUserDisplay";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/register-user-modal.css";

type Props = {
  data: RegisterUserFormData;
  onBack: () => void;
  onCreateAccount: () => void;
  onClose?: () => void;
  closeTo?: string;
};

function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 8V12.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="5.75" r="0.75" fill="currentColor" />
    </svg>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="register-review__field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ReviewUserRegistrationModal({
  data,
  onBack,
  onCreateAccount,
  onClose,
  closeTo,
}: Props) {
  const accountStatusLabel = data.accountActive ? "Active" : "Inactive";
  const reviewNotice = getRegisterReviewNoticeMessage(data);

  const footer = (
    <>
      <button type="button" className="register-review__back-btn" onClick={onBack}>
        Back
      </button>
      <button type="button" className="figma-btn figma-btn--primary register-review__create-btn" onClick={onCreateAccount}>
        <IconUserPlus className="register-review__create-icon" aria-hidden="true" />
        Create Account
      </button>
    </>
  );

  return (
    <FigmaModal
      className="figma-modal--register-review"
      title="Review User Registration"
      subtitle="Verify the details before finalizing the user account creation in the Global directory."
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="register-review__footer"
    >
      <div className="register-review__summary-card">
        <dl className="register-review__summary-grid">
          <SummaryField label="Full Name" value={getRegisterUserFullName(data)} />
          <SummaryField label="Admin Email" value={getRegisterUserEmail(data) || "—"} />
          <SummaryField label="Admin Phone" value={data.adminContactPhone.trim() || "—"} />
          <SummaryField label="Department" value={data.department} />
          <SummaryField label="Role" value={REGISTER_USER_ROLE_LABELS[data.role]} />
          <SummaryField label="Company" value={data.company} />
          <div className="register-review__field">
            <dt>Account Status</dt>
            <dd>
              <span className="register-review__status">
                <span
                  className={`register-review__status-dot${data.accountActive ? "" : " register-review__status-dot--inactive"}`}
                  aria-hidden="true"
                />
                {accountStatusLabel}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {reviewNotice ? (
        <div className="register-review__notice" role="note">
          <span className="register-review__notice-icon" aria-hidden="true">
            <IconInfo />
          </span>
          <p>{reviewNotice}</p>
        </div>
      ) : null}
    </FigmaModal>
  );
}
