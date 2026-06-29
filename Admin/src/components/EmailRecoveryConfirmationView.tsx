import { useEffect } from "react";
import { Link } from "react-router-dom";
import systemAdministratorCheckIcon from "../icons/system-administrator-check-icon.png";
import {
  IconFooterDataProtected,
  IconFooterRoleAccess,
  IconFooterSecure,
} from "./icons/EmailRecoveryConfirmationIcons";
import { SYSTEM_ADMINISTRATOR_EMAIL } from "../data/superAdmin";
import { useCopyWithFeedback } from "../utils/useCopyWithFeedback";
import "../styles/email-recovery-confirmation.css";

type Props = {
  okHref?: string;
};

export default function EmailRecoveryConfirmationView({ okHref = "/admin-login" }: Props) {
  const { copied, copy } = useCopyWithFeedback();

  useEffect(() => {
    document.body.classList.add("email-recovery-confirmation-page");
    return () => document.body.classList.remove("email-recovery-confirmation-page");
  }, []);

  return (
    <div className="email-recovery-confirmation">
      <div className="email-recovery-confirmation__card">
        <div className="email-recovery-confirmation__icon-wrap">
          <span className="email-recovery-confirmation__icon-glow" aria-hidden="true" />
          <div className="email-recovery-confirmation__icon-badge">
            <img
              src={systemAdministratorCheckIcon}
              alt=""
              className="email-recovery-confirmation__check-icon"
              aria-hidden="true"
              draggable={false}
            />
          </div>
        </div>

        <h1 className="email-recovery-confirmation__title">System Administrator</h1>
        <p className="email-recovery-confirmation__subtitle">Email Address</p>

        <div className="email-recovery-confirmation__copy-wrap">
          <button
            type="button"
            className={`email-recovery-confirmation__email${copied ? " email-recovery-confirmation__email--copied" : ""}`}
            onClick={() => copy(SYSTEM_ADMINISTRATOR_EMAIL)}
            aria-label={`Copy email address ${SYSTEM_ADMINISTRATOR_EMAIL}`}
          >
            {SYSTEM_ADMINISTRATOR_EMAIL}
          </button>
          {copied && (
            <p className="email-recovery-confirmation__copy-hint" role="status" aria-live="polite">
              Copied to clipboard
            </p>
          )}
        </div>

        <Link className="email-recovery-confirmation__ok" to={okHref}>
          OK
        </Link>

        <footer className="email-recovery-confirmation__footer">
          <span className="email-recovery-confirmation__footer-item">
            <IconFooterSecure className="email-recovery-confirmation__footer-icon" />
            Secure
          </span>
          <span className="email-recovery-confirmation__footer-divider" aria-hidden="true" />
          <span className="email-recovery-confirmation__footer-item">
            <IconFooterRoleAccess className="email-recovery-confirmation__footer-icon" />
            Role-Based Access
          </span>
          <span className="email-recovery-confirmation__footer-divider" aria-hidden="true" />
          <span className="email-recovery-confirmation__footer-item">
            <IconFooterDataProtected className="email-recovery-confirmation__footer-icon" />
            Data Protected
          </span>
        </footer>
      </div>
    </div>
  );
}
