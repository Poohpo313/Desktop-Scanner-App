import { useEffect } from "react";
import { Link } from "react-router-dom";
import systemAdministratorCheckIcon from "../icons/system-administrator-check-icon.png";
import {
  IconFooterDataProtected,
  IconFooterRoleAccess,
  IconFooterSecure,
} from "./icons/EmailRecoveryConfirmationIcons";
import { SYSTEM_ADMINISTRATOR_PHONE } from "../data/superAdmin";
import { useCopyWithFeedback } from "../utils/useCopyWithFeedback";
import "../styles/sms-recovery-confirmation.css";

type Props = {
  okHref?: string;
};

export default function SmsRecoveryConfirmationView({ okHref = "/admin-login" }: Props) {
  const { copied, copy } = useCopyWithFeedback();

  useEffect(() => {
    document.body.classList.add("sms-recovery-confirmation-page");
    return () => document.body.classList.remove("sms-recovery-confirmation-page");
  }, []);

  return (
    <div className="sms-recovery-confirmation">
      <div className="sms-recovery-confirmation__card">
        <div className="sms-recovery-confirmation__icon-wrap">
          <span className="sms-recovery-confirmation__icon-glow" aria-hidden="true" />
          <div className="sms-recovery-confirmation__icon-badge">
            <img
              src={systemAdministratorCheckIcon}
              alt=""
              className="sms-recovery-confirmation__check-icon"
              aria-hidden="true"
              draggable={false}
            />
          </div>
        </div>

        <h1 className="sms-recovery-confirmation__title">System Administrator</h1>
        <p className="sms-recovery-confirmation__subtitle">Phone Number</p>

        <div className="sms-recovery-confirmation__copy-wrap">
          <button
            type="button"
            className={`sms-recovery-confirmation__phone${copied ? " sms-recovery-confirmation__phone--copied" : ""}`}
            onClick={() => copy(SYSTEM_ADMINISTRATOR_PHONE)}
            aria-label={`Copy phone number ${SYSTEM_ADMINISTRATOR_PHONE}`}
          >
            {SYSTEM_ADMINISTRATOR_PHONE}
          </button>
          {copied && (
            <p className="sms-recovery-confirmation__copy-hint" role="status" aria-live="polite">
              Copied to clipboard
            </p>
          )}
        </div>

        <Link className="sms-recovery-confirmation__ok" to={okHref}>
          OK
        </Link>

        <footer className="sms-recovery-confirmation__footer">
          <span className="sms-recovery-confirmation__footer-item">
            <IconFooterSecure className="sms-recovery-confirmation__footer-icon" />
            Secure
          </span>
          <span className="sms-recovery-confirmation__footer-divider" aria-hidden="true" />
          <span className="sms-recovery-confirmation__footer-item">
            <IconFooterRoleAccess className="sms-recovery-confirmation__footer-icon" />
            Role-Based Access
          </span>
          <span className="sms-recovery-confirmation__footer-divider" aria-hidden="true" />
          <span className="sms-recovery-confirmation__footer-item">
            <IconFooterDataProtected className="sms-recovery-confirmation__footer-icon" />
            Data Protected
          </span>
        </footer>
      </div>
    </div>
  );
}
