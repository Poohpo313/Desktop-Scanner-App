import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecoveryRequestStatus, getRecoveryRequestPhase, getStoredRecoveryRequestId, getStoredRecoverySubmittedAt, type RecoveryStatusPhase } from "../../data/recoveryRequestStatus";
import { SUPER_ADMIN } from "../../data/superAdmin";
import { copyToClipboard } from "../../utils/copyToClipboard";
import FigmaModal from "../portal/FigmaModal";
import {
  IconComposeInfo,
  IconComposeLock,
  IconComposePortalGlobe,
  IconComposeSend,
  IconComposeShield,
} from "../icons/ComposeEmailIcons";
import {
  IconRecoveryStatusAdminInfo,
  IconRecoveryStatusContactClock,
  IconRecoveryStatusRefresh,
  IconRecoveryStatusStepCheck,
  IconRecoveryStatusStepCurrent,
  IconRecoveryStatusStepPending,
} from "../icons/RecoveryStatusIcons";
import {
  IconSendRecoverySmsBack,
  IconSendRecoverySmsHeader,
  IconSendRecoverySmsNotice,
  IconSendRecoverySmsSend,
  IconSendRecoverySmsVerified,
  IconSmsSuccessCheck,
  IconSmsSuccessEye,
  IconSmsSuccessLogin,
  IconSmsSuccessPending,
  IconSmsSuccessInfo,
} from "../icons/SmsRecoveryIcons";
import {
  IconEmailSuccessCheck,
  IconEmailSuccessEye,
  IconEmailSuccessId,
  IconEmailSuccessInfo,
  IconEmailSuccessLogin,
  IconEmailSuccessPending,
  IconEmailSuccessShieldCheck,
  IconEmailSuccessStepCheck,
  IconEmailSuccessStepCheckMuted,
  IconEmailSuccessUnderReview,
  IconEmailSuccessIdentityVerification,
  IconEmailSuccessCredentialsReleased,
} from "../icons/EmailSuccessIcons";
import {
  IconRecoveryContactHelp,
  IconRecoveryInfo,
  IconRecoveryPending,
  IconRecoveryReviewClock,
  IconRecoverySuccess,
} from "../icons/RecoveryIcons";
import {
  IconCopiedClipboard,
  IconCopiedContactView,
  IconCopiedInfo,
  IconCopiedMailOpen,
  IconCopiedPhoneHandset,
  IconCopiedSuccessCheck,
  IconContactDetailsAvailable,
  IconContactDetailsClock,
  IconContactDetailsCopy,
  IconContactDetailsEmail,
  IconContactDetailsOpen,
  IconContactDetailsPhone,
  IconContactDetailsShieldCheck,
  IconContactDetailsShieldUser,
  IconContactDetailsSms,
  IconPhoneCopiedStatus,
  IconRecoveryHelpCheck,
  IconRecoveryHelpClock,
  IconRecoveryHelpCopy,
  IconRecoveryHelpCopyField,
  IconRecoveryHelpHeader,
  IconRecoveryHelpInfo,
  IconRecoveryHelpShield,
} from "../icons/RecoveryCopyIcons";
import "../../styles/recovery-modals.css";
import "../../styles/compose-email-modal.css";
import "../../styles/email-success-modal.css";
import "../../styles/send-recovery-sms-modal.css";
import "../../styles/sms-success-modal.css";
import "../../styles/recovery-request-status-modal.css";
import "../../styles/email-copied-modal.css";
import "../../styles/phone-copied-modal.css";
import "../../styles/email-recovery-instructions-modal.css";
import "../../styles/view-contact-details-modal.css";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import viewContactProfileAvatar from "../../icons/login/view-contact-profile-avatar.png";
const SMS_RECOVERY_MESSAGE =
  "Hello Super Administrator, I'm requesting assistance in recovering my admin account credentials. Please contact me regarding the verification process. Thank you";
const SMS_CHAR_LIMIT = 160;

export function ConfirmRecoveryModal({
  closeTo = "/forgot-credentials",
  submitTo = "/forgot-credentials-2212-2433",
}: {
  closeTo?: string;
  submitTo?: string;
}) {
  return (
    <FigmaModal
      title="Confirm Recovery Request"
      hideClose
      className="figma-modal--recovery-confirm"
      footerClassName="figma-modal__footer--equal-actions"
      footer={
        <>
          <Link to={closeTo} className="figma-btn figma-btn--secondary">
            Cancel
          </Link>
          <Link to={submitTo} className="figma-btn figma-btn--primary">
            Submit Request
          </Link>
        </>
      }
    >
      <p className="recovery-confirm-copy">
        You are about to submit a credential recovery request to the Super Administrator. The Super
        Administrator will verify your identity before releasing account credentials.
      </p>
      <div className="recovery-confirm-info">
        <div className="recovery-confirm-info__header">
          <IconRecoveryInfo className="recovery-confirm-info__icon" aria-hidden="true" />
          <strong className="recovery-confirm-info__title">Important Recovery Information</strong>
        </div>
        <ul className="recovery-confirm-info__list">
          <li>Verification may take up to 24–48 hours</li>
          <li>Government ID or company identification may be required</li>
          <li>Credentials will only be released after successful verification.</li>
        </ul>
      </div>
    </FigmaModal>
  );
}

export function RecoverySubmittedModal({
  loginTo = "/admin-login",
  contactTo = "/contact-super-admin",
}: {
  closeTo?: string;
  loginTo?: string;
  contactTo?: string;
}) {
  return (
    <FigmaModal success hideHeader hideClose className="figma-modal--recovery-submitted">
      <IconRecoverySuccess className="recovery-submitted-icon" aria-hidden="true" />
      <h2 className="recovery-submitted-title">Recovery Request Submitted</h2>
      <p className="recovery-submitted-copy">
        <span className="recovery-submitted-copy__line">
          Your credential recovery request has been
        </span>
        <span className="recovery-submitted-copy__line">
          successfully submitted. The Super Administrator will
        </span>
        <span className="recovery-submitted-copy__line">
          review your request and contact you through your
        </span>
        <span className="recovery-submitted-copy__line">registered email address.</span>
      </p>

      <div className="recovery-submitted-details">
        <div className="recovery-submitted-details__row">
          <span className="recovery-submitted-details__label">Request Number</span>
          <span className="recovery-submitted-details__value recovery-submitted-details__value--id">
            {getStoredRecoveryRequestId() || "Pending"}
          </span>
        </div>
        <div className="recovery-submitted-details__row">
          <span className="recovery-submitted-details__label">Status Badge</span>
          <span className="recovery-submitted-badge">
            <IconRecoveryPending className="recovery-submitted-badge__icon" aria-hidden="true" />
            Pending Verification
          </span>
        </div>
        <div className="recovery-submitted-details__row">
          <span className="recovery-submitted-details__label">Expected Review Time</span>
          <span className="recovery-submitted-details__value">
            <IconRecoveryReviewClock className="recovery-submitted-details__clock" aria-hidden="true" />
            24-48 Hours
          </span>
        </div>
      </div>

      <div className="recovery-submitted-actions">
        <Link to={loginTo} className="figma-btn figma-btn--primary figma-btn--block">
          Back to Login
        </Link>
        <Link to={contactTo} className="figma-btn figma-btn--outline-green figma-btn--block">
          <IconRecoveryContactHelp className="recovery-submitted-actions__contact-icon" aria-hidden="true" />
          Contact Super Admin
        </Link>
      </div>

      <p className="recovery-submitted-footer">
        <span className="recovery-submitted-footer__line">
          Need immediate assistance? Please contact our technical support
        </span>
        <span className="recovery-submitted-footer__line">
          hotline at <strong>1-800-SCAN-ADM</strong>.
        </span>
      </p>
    </FigmaModal>
  );
}

type RecoveryStepState = "done" | "current" | "pending";

type RecoveryStep = {
  state: RecoveryStepState;
  step: number;
  title: string;
  desc: string;
  Marker: typeof IconRecoveryStatusStepCheck;
};

const RECOVERY_PHASE_ACTIVE_STEP: Record<RecoveryStatusPhase, number> = {
  "under-review": 2,
  "identity-verification": 3,
  "credentials-released": 4,
};

function buildRecoverySteps(phase: RecoveryStatusPhase): RecoveryStep[] {
  const activeStep = RECOVERY_PHASE_ACTIVE_STEP[phase];

  const stepState = (step: number): RecoveryStepState => {
    if (step < activeStep) return "done";
    if (step === activeStep) return "current";
    return "pending";
  };

  const stepMarker = (step: number) => {
    const state = stepState(step);
    if (state === "done") return IconRecoveryStatusStepCheck;
    if (state === "current") return IconRecoveryStatusStepCurrent;
    return IconRecoveryStatusStepPending;
  };

  return [
    {
      state: stepState(1),
      step: 1,
      title: "Request Submitted",
      desc: "Initial application received and timestamped.",
      Marker: stepMarker(1),
    },
    {
      state: stepState(2),
      step: 2,
      title: "Under Review",
      desc:
        phase === "under-review"
          ? "Your request is in the administrator queue for preliminary review."
          : "Queue processing and preliminary data check completed.",
      Marker: stepMarker(2),
    },
    {
      state: stepState(3),
      step: 3,
      title: "Identity Verification",
      desc:
        phase === "credentials-released"
          ? "Security credentials validated successfully."
          : phase === "identity-verification"
            ? "Administrator is currently validating security credentials."
            : "Awaiting identity validation by the administrator.",
      Marker: stepMarker(3),
    },
    {
      state: stepState(4),
      step: 4,
      title: "Credentials Released",
      desc:
        phase === "credentials-released"
          ? "Your credentials have been released. Check your secure channel for access details."
          : "Final key handover and audit log entry creation.",
      Marker: stepMarker(4),
    },
  ];
}

const RECOVERY_STATUS_COPY: Record<
  RecoveryStatusPhase,
  { badge: string; noteTitle: string; noteText: string }
> = {
  "under-review": {
    badge: "Under Review",
    noteTitle: "Administrative Note",
    noteText:
      "Your request is currently being reviewed by the Super Administrator. Expected turnaround: 2–4 hours.",
  },
  "identity-verification": {
    badge: "Pending Verification",
    noteTitle: "Verification In Progress",
    noteText:
      "Your request has moved to identity verification. The Super Administrator is validating your security credentials.",
  },
  "credentials-released": {
    badge: "Credentials Released",
    noteTitle: "Recovery Complete",
    noteText:
      "Your credentials have been released. Use the details provided by the Super Administrator to regain access to your account.",
  },
};

function refreshNoticeForTransition(from: RecoveryStatusPhase, to: RecoveryStatusPhase): string {
  if (from === to) {
    if (to === "credentials-released") {
      return "Status unchanged — your credentials have already been released.";
    }
    if (to === "identity-verification") {
      return "Status unchanged — the Super Administrator has not advanced your request yet. Still in identity verification.";
    }
    return "Status unchanged — the Super Administrator has not updated your request yet. It is still under review.";
  }

  if (to === "identity-verification") {
    return "Status updated — your request is now in identity verification.";
  }

  if (to === "credentials-released") {
    return "Status updated — your credentials have been released (Step 4).";
  }

  return "Status updated.";
}

export function RecoveryRequestStatusModal({
  closeTo = "/forgot-credentials",
  contactTo = "/contact-super-admin",
}: {
  closeTo?: string;
  contactTo?: string;
}) {
  const [phase, setPhase] = useState<RecoveryStatusPhase>(() => getRecoveryRequestPhase());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [statusHighlight, setStatusHighlight] = useState(false);

  useEffect(() => {
    void fetchRecoveryRequestStatus().then(setPhase);
  }, []);

  const steps = buildRecoverySteps(phase);
  const statusCopy = RECOVERY_STATUS_COPY[phase];

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setRefreshNotice(null);
    setStatusHighlight(false);

    try {
      const previousPhase = phase;
      const nextPhase = await fetchRecoveryRequestStatus();

      setPhase(nextPhase);
      if (nextPhase !== previousPhase) setStatusHighlight(true);
      setRefreshNotice(refreshNoticeForTransition(previousPhase, nextPhase));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <FigmaModal
      title="Recovery Request Status"
      subtitle="Manage and track your credential restoration journey"
      onClose={closeTo}
      closeIcon={<img src={closeIcon} alt="" width={14} height={14} aria-hidden="true" />}
      className="figma-modal--recovery-status"
      footer={
        <>
          <Link to={contactTo} className="recovery-status-actions__contact">
            <IconRecoveryStatusContactClock className="recovery-status-actions__icon" aria-hidden="true" />
            Contact Super Admin
          </Link>
          <button
            type="button"
            className={`recovery-status-actions__refresh${isRefreshing ? " recovery-status-actions__refresh--loading" : ""}`}
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
          >
            <IconRecoveryStatusRefresh className="recovery-status-actions__icon" aria-hidden="true" />
            {isRefreshing ? "Refreshing…" : "Refresh Status"}
          </button>
        </>
      }
    >
      <div className="recovery-status-summary">
        <div className="recovery-status-summary__card">
          <span className="recovery-status-summary__label">Request ID</span>
          <span className="recovery-status-summary__value recovery-status-summary__value--id">
            {getStoredRecoveryRequestId() || "Pending"}
          </span>
        </div>
        <div className="recovery-status-summary__card">
          <span className="recovery-status-summary__label">Submitted Date</span>
          <span className="recovery-status-summary__value recovery-status-summary__value--date">
            {getStoredRecoverySubmittedAt()
              ? new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(getStoredRecoverySubmittedAt()!))
              : "—"}
          </span>
        </div>
        <div className="recovery-status-summary__card">
          <span className="recovery-status-summary__label">Current Status</span>
          <span
            className={`recovery-status-summary__badge${statusHighlight ? " recovery-status-summary__badge--highlight" : ""}`}
          >
            {statusCopy.badge}
          </span>
        </div>
      </div>

      {refreshNotice && (
        <p className="recovery-status-refresh-note" role="status">
          {refreshNotice}
        </p>
      )}

      <div className="recovery-status-content">
        <h3 className="recovery-status-progress__title">Request Progress</h3>
        <div className="recovery-status-stepper">
        {steps.map((step) => (
          <div
            key={step.title}
            className={`recovery-status-step recovery-status-step--${step.state}`}
          >
            <step.Marker className="recovery-status-step__marker" aria-hidden="true" />
            <div>
              <div className="recovery-status-step__title">
                Step {step.step}: {step.title}
              </div>
              <div className="recovery-status-step__desc">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

        <div className="recovery-status-note">
          <IconRecoveryStatusAdminInfo className="recovery-status-note__icon" aria-hidden="true" />
          <div className="recovery-status-note__content">
            <strong className="recovery-status-note__title">{statusCopy.noteTitle}</strong>
            <p className="recovery-status-note__text">{statusCopy.noteText}</p>
          </div>
        </div>
      </div>
    </FigmaModal>
  );
}

const COMPOSE_EMAIL_DEFAULT_MESSAGE = `Hello Super Administrator,

I am requesting assistance in recovering my administrator account credentials.
Please contact me regarding the verification process.

Thank you.`;

export function ComposeRecoveryEmailModal() {
  return (
    <div className="compose-email-shell">
      <div className="compose-email-card">
        <IconComposeShield className="compose-email-card__icon" aria-hidden="true" />
        <h2 className="compose-email-card__title">Compose Recovery Email</h2>
        <p className="compose-email-card__subtitle">
          Securely request credential assistance from
          <br />
          your system administrator.
        </p>

        <div className="compose-email-field">
          <label className="compose-email-field__label">To</label>
          <div className="compose-email-field__control compose-email-field__control--readonly">
            <IconComposeLock className="compose-email-field__control-icon" aria-hidden="true" />
            <input
              className="compose-email-field__input compose-email-field__input--muted"
              defaultValue={SUPER_ADMIN.email}
              readOnly
            />
          </div>
        </div>

        <div className="compose-email-field">
          <label className="compose-email-field__label">Subject</label>
          <div className="compose-email-field__control">
            <input className="compose-email-field__input" defaultValue="Credential Recovery Request" readOnly />
          </div>
        </div>

        <div className="compose-email-field">
          <label className="compose-email-field__label">Message</label>
          <div className="compose-email-field__control compose-email-field__control--textarea">
            <textarea
              className="compose-email-field__textarea"
              defaultValue={COMPOSE_EMAIL_DEFAULT_MESSAGE}
              aria-label="Email message body"
            />
          </div>
        </div>

        <div className="compose-email-notice">
          <IconComposeInfo className="compose-email-notice__icon" aria-hidden="true" />
          <p className="compose-email-notice__text">
            Your recovery email has been prepared and is ready to send.
          </p>
        </div>

        <div className="compose-email-actions">
          <Link to="/chose-send-email-as-contact-method" className="compose-email-actions__back">
            Back
          </Link>
          <Link to="/success-modal-card" className="compose-email-actions__send">
            <IconComposeSend className="compose-email-actions__send-icon" aria-hidden="true" />
            Send Email
          </Link>
        </div>

        <div className="compose-email-card__footer">
          <IconComposePortalGlobe className="compose-email-card__footer-icon" aria-hidden="true" />
          BUKOLABS.IO SECURITY PORTAL
        </div>
      </div>
      </div>
  );
}

export function SendRecoverySmsModal() {
  const [message, setMessage] = useState(SMS_RECOVERY_MESSAGE);
  const charCount = message.length;
  const isOverLimit = charCount > SMS_CHAR_LIMIT;
  const progress = Math.min(100, (charCount / SMS_CHAR_LIMIT) * 100);

  return (
    <div className="send-recovery-sms-shell">
      <div className="send-recovery-sms-card">
        <header className="send-recovery-sms-card__header">
          <div className="send-recovery-sms-card__header-top">
            <IconSendRecoverySmsHeader className="send-recovery-sms-card__header-icon" aria-hidden="true" />
            <h2 className="send-recovery-sms-card__title">Send Recovery SMS</h2>
          </div>
          <p className="send-recovery-sms-card__subtitle">
            Contact the Super Administrator through SMS for credential recovery assistance.
          </p>
        </header>

        <hr className="send-recovery-sms-card__divider" />

        <div className="send-recovery-sms-card__body">
          <div className="send-recovery-sms-field">
            <div className="send-recovery-sms-field__label-row">
              <label className="send-recovery-sms-field__label">Recipient Number</label>
              <IconSendRecoverySmsVerified className="send-recovery-sms-field__verified" aria-hidden="true" />
            </div>
            <div className="send-recovery-sms-field__control">
              <IconComposeLock className="send-recovery-sms-field__control-icon" aria-hidden="true" />
              <input
                className="send-recovery-sms-field__input"
                defaultValue={SUPER_ADMIN.phone}
                readOnly
              />
            </div>
          </div>

          <div className="send-recovery-sms-field">
            <label className="send-recovery-sms-field__label">Message Template</label>
            <div className="send-recovery-sms-field__control send-recovery-sms-field__control--textarea">
              <textarea
                className={`send-recovery-sms-field__textarea${isOverLimit ? " send-recovery-sms-field__textarea--over" : ""}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-label="SMS message body"
                aria-invalid={isOverLimit}
              />
            </div>
            <div className="send-recovery-sms-field__meta-wrap">
              <div className="send-recovery-sms-field__meta">
                <span
                  className={`send-recovery-sms-field__count${isOverLimit ? " send-recovery-sms-field__count--over" : ""}`}
                  role="status"
                >
                  {charCount} / {SMS_CHAR_LIMIT} Characters
                </span>
                <div className="send-recovery-sms-field__progress" aria-hidden="true">
                  <span
                    className={`send-recovery-sms-field__progress-fill${isOverLimit ? " send-recovery-sms-field__progress-fill--over" : ""}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {isOverLimit && (
                <span className="send-recovery-sms-field__limit-note" role="alert">
                  Cannot send — message exceeds the 160 character limit.
                </span>
              )}
            </div>
          </div>

          <div className="send-recovery-sms-notice">
            <IconSendRecoverySmsNotice className="send-recovery-sms-notice__icon" aria-hidden="true" />
            <p className="send-recovery-sms-notice__text">
              Recovery requests submitted via SMS may require identity verification before credentials
              can be released.
            </p>
          </div>
        </div>

        <hr className="send-recovery-sms-card__divider" />

        <footer className="send-recovery-sms-card__footer">
          <Link to="/chose-send-sms-as-contact-method" className="send-recovery-sms-actions__back">
            <IconSendRecoverySmsBack className="send-recovery-sms-actions__back-icon" aria-hidden="true" />
            Back
          </Link>
          {isOverLimit ? (
            <span className="send-recovery-sms-actions__send send-recovery-sms-actions__send--disabled" aria-disabled="true">
              Send SMS
              <IconSendRecoverySmsSend className="send-recovery-sms-actions__send-icon" aria-hidden="true" />
            </span>
          ) : (
            <Link to="/sms-sent-successfully-modal" className="send-recovery-sms-actions__send">
            Send SMS
              <IconSendRecoverySmsSend className="send-recovery-sms-actions__send-icon" aria-hidden="true" />
          </Link>
          )}
        </footer>
      </div>
    </div>
  );
}

export function SmsSentSuccessfullyModal({
  loginTo = "/admin-login",
  recoveryTo = "/recovery-request-method",
}: {
  loginTo?: string;
  recoveryTo?: string;
}) {
  return (
    <FigmaModal hideHeader hideClose className="figma-modal--sms-success">
      <IconSmsSuccessCheck className="sms-success-icon" aria-hidden="true" />
      <h2 className="sms-success-title">SMS Sent Successfully</h2>
      <p className="sms-success-copy">
        Your recovery request has been sent to the Super Administrator.
      </p>

      <span className="sms-success-badge">
        <IconSmsSuccessPending className="sms-success-badge__icon" aria-hidden="true" />
        Pending Verification
      </span>

      <div className="sms-success-callout">
        <IconSmsSuccessInfo className="sms-success-callout__icon" aria-hidden="true" />
        <p className="sms-success-callout__text">
          You may receive a response through SMS, email, or a scheduled verification call. Please keep
          your registered device nearby.
        </p>
      </div>

      <div className="sms-success-actions">
        <Link to={recoveryTo} className="sms-success-actions__secondary">
          <IconSmsSuccessEye className="sms-success-actions__icon" aria-hidden="true" />
          View Recovery Process
        </Link>
        <Link to={loginTo} className="sms-success-actions__primary">
          <IconSmsSuccessLogin className="sms-success-actions__icon" aria-hidden="true" />
          Back to Login
        </Link>
      </div>
    </FigmaModal>
  );
}

const EMAIL_SUCCESS_STEPS = [
  { state: "done" as const, title: "Request Submitted", desc: "—" },
  { state: "done" as const, title: "Email Delivered", desc: "System Relay OK" },
  { state: "current" as const, title: "Under Review", desc: "24-48 Hours" },
  { state: "pending" as const, title: "Identity Verification", desc: "Pending Review" },
  { state: "pending" as const, title: "Credentials Released", desc: "Final Step" },
];

export function SuccessModalCard({ title = "Email Sent Successfully", next = "/admin-login" }: { title?: string; next?: string }) {
  if (title !== "Email Sent Successfully") {
  return (
    <FigmaModal success hideHeader onClose="/compose-email-modal">
        <IconEmailSuccessCheck className="email-success-icon" aria-hidden="true" />
        <h2 className="email-success-title">{title}</h2>
        <p className="email-success-copy">
        Your message has been delivered. The Super Administrator will respond through your registered
        contact channel.
      </p>
        <Link to={next} className="email-success-actions__primary email-success-actions__primary--solo">
        Done
      </Link>
    </FigmaModal>
  );
}

  return (
    <FigmaModal hideHeader hideClose className="figma-modal--email-success">
      <div className="email-success-hero">
        <IconEmailSuccessCheck className="email-success-icon" aria-hidden="true" />
        <h2 className="email-success-title">{title}</h2>
        <p className="email-success-copy">
          Your credential recovery request has been successfully sent to the
          <br />
          Super Administrator. Your request is now awaiting identity
          <br />
          verification before account credentials can be released.
        </p>

        <div className="email-success-badges">
          <span className="email-success-badge email-success-badge--status">
            <IconEmailSuccessPending className="email-success-badge__icon" aria-hidden="true" />
            Status: Pending Verification
          </span>
          <span className="email-success-badge email-success-badge--id">
            <IconEmailSuccessId className="email-success-badge__icon" aria-hidden="true" />
            ID: REC-2026-001245
          </span>
        </div>
      </div>

      <div className="email-success-track">
        <div className="email-success-track__row">
          {EMAIL_SUCCESS_STEPS.map((step) => (
            <div
              key={step.title}
              className={`email-success-track__step email-success-track__step--${step.state}`}
            >
              <div className="email-success-track__marker">
                {step.state === "current" ? (
                  <IconEmailSuccessUnderReview className="email-success-track__step-icon" aria-hidden="true" />
                ) : step.state === "pending" && step.title === "Identity Verification" ? (
                  <div className="email-success-track__dot">
                    <IconEmailSuccessIdentityVerification
                      className="email-success-track__inner-icon"
                      aria-hidden="true"
                    />
                  </div>
                ) : step.state === "pending" && step.title === "Credentials Released" ? (
                  <div className="email-success-track__dot">
                    <IconEmailSuccessCredentialsReleased
                      className="email-success-track__inner-icon"
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div className="email-success-track__dot">
                    {step.state === "done" && <IconEmailSuccessStepCheck aria-hidden="true" />}
                    {step.state === "pending" && <IconEmailSuccessStepCheckMuted aria-hidden="true" />}
                  </div>
                )}
              </div>
              <div className="email-success-track__title">{step.title}</div>
              <div className="email-success-track__desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="email-success-next">
        <IconEmailSuccessInfo className="email-success-next__icon" aria-hidden="true" />
        <div className="email-success-next__content">
          <h3 className="email-success-next__title">What happens next?</h3>
          <ul className="email-success-next__list">
            <li>
              <span className="email-success-next__bullet" aria-hidden="true" />
              <span>
                A Super Administrator will review your request against system logs and access timestamps.
              </span>
            </li>
            <li>
              <span className="email-success-next__bullet" aria-hidden="true" />
              <span>
                You may receive a secondary verification call or email to your registered emergency contact.
              </span>
            </li>
            <li>
              <span className="email-success-next__bullet" aria-hidden="true" />
              <span>
                Once approved, temporary credentials will be released via the secure enterprise relay.
              </span>
            </li>
          </ul>
          <p className="email-success-next__note">
            <IconEmailSuccessShieldCheck className="email-success-next__note-icon" aria-hidden="true" />
            <span>Support will only contact you using your previously registered information.</span>
          </p>
        </div>
      </div>

      <div className="email-success-actions">
        <Link to={next} className="email-success-actions__primary">
          <IconEmailSuccessLogin className="email-success-actions__icon" aria-hidden="true" />
          Back to Login
        </Link>
        <Link to="/forgot-credentials" className="email-success-actions__secondary">
          <IconEmailSuccessEye className="email-success-actions__icon" aria-hidden="true" />
          View Recovery Process
        </Link>
      </div>

      <div className="email-success-bar">
        <span>Secure Enterprise Node: DC-EAST-04</span>
        <span>2024 AdminGuard Security V4.2</span>
      </div>
    </FigmaModal>
  );
}

const RECOVERY_EMAIL_SUBJECT = "Credential Recovery Request";
const RECOVERY_EMAIL_TEMPLATE = `Subject: ${RECOVERY_EMAIL_SUBJECT}

Full Name:
Username:
Contact Number:
Admin Email:
Reason:

Please verify my identity and assist with credential recovery.`;

const RECOVERY_TEMPLATE_FIELDS = [
  "Full Name",
  "Username",
  "Contact Number",
  "Admin Email",
  "Reason",
];

export function EmailRecoveryInstructionsModal({
  closeTo = "/contact-super-admin",
  backTo = "/email-copied-successfully-modal",
}: {
  closeTo?: string;
  backTo?: string;
}) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);

  const flashEmailCopy = () => {
    copyToClipboard(SUPER_ADMIN.email);
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 1800);
  };

  const flashTemplateCopy = () => {
    copyToClipboard(RECOVERY_EMAIL_TEMPLATE);
    setTemplateCopied(true);
    window.setTimeout(() => setTemplateCopied(false), 1800);
  };

  return (
    <FigmaModal
      hideHeader
      hideClose
      className="figma-modal--recovery-help"
      footer={
        <>
          <button
            type="button"
            className={`recovery-help-footer__primary${templateCopied ? " recovery-help-footer__primary--copied" : ""}`}
            onClick={flashTemplateCopy}
          >
            <IconRecoveryHelpCopy aria-hidden="true" />
            {templateCopied ? "Copied" : "Copy Recovery Template"}
          </button>
          <div className="recovery-help-footer__actions">
            <Link to={backTo} className="recovery-help-footer__secondary">
              Back
            </Link>
            <Link to={closeTo} className="recovery-help-footer__secondary">
              Close
        </Link>
          </div>
        </>
      }
    >
      <div className="figma-modal__header">
        <div className="figma-modal__title-row">
          <IconRecoveryHelpHeader className="figma-modal__header-icon" aria-hidden="true" />
          <h2 id="figma-modal-title" className="figma-modal__title">
            Credential Recovery Help
          </h2>
        </div>
        <Link to={closeTo} className="figma-modal__close" aria-label="Close">
          <img src={closeIcon} alt="" draggable={false} />
        </Link>
      </div>

      <div className="recovery-help-intro">
        <IconRecoveryHelpInfo className="recovery-help-intro__icon" aria-hidden="true" />
        <div>
          <h3 className="recovery-help-intro__title">Email Recovery Instructions</h3>
          <p className="recovery-help-intro__copy">
            Follow these steps to securely request access to your account credentials from the system
            administrator.
          </p>
        </div>
      </div>

      <div className="recovery-help-layout">
        <div className="recovery-help-steps">
          <div className="recovery-help-step">
            <span className="recovery-help-step__badge">1</span>
            <p className="recovery-help-step__text">Open your preferred email application.</p>
          </div>
          <div className="recovery-help-step">
            <span className="recovery-help-step__badge">2</span>
            <p className="recovery-help-step__text">Create a new email.</p>
          </div>
          <div className="recovery-help-step">
            <span className="recovery-help-step__badge">3</span>
            <div className="recovery-help-step__content">
              <p className="recovery-help-step__text">Paste the recipient address:</p>
              <div className="recovery-help-step__field">
                <span
                  className={`recovery-help-step__value${emailCopied ? " recovery-help-step__value--copied" : ""}`}
                >
                  {SUPER_ADMIN.email}
                </span>
                <button
                  type="button"
                  className={`recovery-help-step__copy${emailCopied ? " recovery-help-step__copy--copied" : ""}`}
                  aria-label={emailCopied ? "Email copied" : "Copy email address"}
                  onClick={flashEmailCopy}
                >
                  <IconRecoveryHelpCopyField aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="recovery-help-step">
            <span className="recovery-help-step__badge">4</span>
            <div className="recovery-help-step__content">
              <p className="recovery-help-step__text">Use subject:</p>
              <div className="recovery-help-step__field">
                <span className="recovery-help-step__value">&quot;{RECOVERY_EMAIL_SUBJECT}&quot;</span>
              </div>
            </div>
          </div>
          <div className="recovery-help-step">
            <span className="recovery-help-step__badge">5</span>
            <div className="recovery-help-step__content">
              <p className="recovery-help-step__text">Include template info:</p>
              <div className="recovery-help-template-grid">
                {RECOVERY_TEMPLATE_FIELDS.map((field) => (
                  <span key={field} className="recovery-help-template-item">
                    <IconRecoveryHelpCheck className="recovery-help-template-item__icon" aria-hidden="true" />
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="recovery-help-step">
            <span className="recovery-help-step__badge">6</span>
            <p className="recovery-help-step__text">Wait for verification instructions.</p>
          </div>
        </div>

        <aside className="recovery-help-sidebar">
          <div className="recovery-help-card recovery-help-card--security">
            <div className="recovery-help-card__head">
              <IconRecoveryHelpShield className="recovery-help-card__icon" aria-hidden="true" />
              <h4 className="recovery-help-card__title">Security Protocol</h4>
            </div>
            <p className="recovery-help-card__copy">
              Identity verification is required before any credentials are released.
            </p>
          </div>
          <div className="recovery-help-card recovery-help-card--sla">
            <div className="recovery-help-card__head">
              <IconRecoveryHelpClock className="recovery-help-card__icon" aria-hidden="true" />
              <h4 className="recovery-help-card__title">SLA Review Time</h4>
            </div>
            <p className="recovery-help-card__sla">24–48 Hours</p>
          </div>
          <div className="recovery-help-card recovery-help-card--help">
            <p className="recovery-help-card__help-label">Need immediate help?</p>
            <Link to="/view-contact-details-modal" className="recovery-help-card__help-link">
              Contact IT Desk
      </Link>
          </div>
        </aside>
      </div>
    </FigmaModal>
  );
}

export function EmailCopiedModal({
  closeTo = "/contact-super-admin",
  instructionsTo = "/email-recovery-instructions-modal",
}: {
  closeTo?: string;
  instructionsTo?: string;
}) {
  const [clipboardActive, setClipboardActive] = useState(false);

  useEffect(() => {
    copyToClipboard(SUPER_ADMIN.email);
    const timer = window.setTimeout(() => setClipboardActive(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <FigmaModal hideHeader hideClose className="figma-modal--email-copied">
      <IconCopiedSuccessCheck className="email-copied-icon" aria-hidden="true" />
      <h2 className="email-copied-title">Email Copied Successfully</h2>
      <p className="email-copied-copy">
        The Super Administrator&apos;s email address has
        <br />
        been copied to your clipboard.
      </p>

      <div className={`email-copied-panel${clipboardActive ? " email-copied-panel--active" : ""}`}>
        <div className="email-copied-panel__head">
          <span className="email-copied-panel__label">Active Email</span>
          <span className={`email-copied-panel__status${clipboardActive ? " email-copied-panel__status--active" : ""}`}>
            <IconCopiedClipboard className="email-copied-panel__status-icon" aria-hidden="true" />
            Active in Clipboard
          </span>
        </div>
        <div className={`email-copied-panel__field${clipboardActive ? " email-copied-panel__field--active" : ""}`}>
          {SUPER_ADMIN.email}
        </div>
      </div>

      <div className="email-copied-callout">
        <IconCopiedInfo className="email-copied-callout__icon" aria-hidden="true" />
        <p className="email-copied-callout__text">
          <strong>Next Step:</strong> Paste the email into your preferred email application and send your
          credential recovery request.
        </p>
      </div>

      <div className="email-copied-actions">
        <Link to={instructionsTo} className="email-copied-actions__primary">
          <IconCopiedMailOpen className="email-copied-actions__icon" aria-hidden="true" />
          Open Email Instructions
        </Link>
        <Link to={closeTo} className="email-copied-actions__secondary">
          Close
        </Link>
      </div>
    </FigmaModal>
  );
}

export function PhoneCopiedModal({
  closeTo = "/contact-super-admin",
  detailsTo = "/view-contact-details-modal",
}: {
  closeTo?: string;
  detailsTo?: string;
}) {
  const [clipboardActive, setClipboardActive] = useState(false);

  useEffect(() => {
    copyToClipboard(SUPER_ADMIN.phone);
    const timer = window.setTimeout(() => setClipboardActive(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <FigmaModal hideHeader hideClose className="figma-modal--phone-copied">
      <IconCopiedSuccessCheck className="phone-copied-icon" aria-hidden="true" />
      <h2 className="phone-copied-title">Phone Number Copied Successfully</h2>
      <p className="phone-copied-copy">
        The Super Administrator&apos;s phone number has been copied to your clipboard.
      </p>

      <div className={`phone-copied-panel${clipboardActive ? " phone-copied-panel--active" : ""}`}>
        <div className="phone-copied-panel__head">
          <span className="phone-copied-panel__label">Credential Recovery Contact</span>
          <span className={`phone-copied-panel__status${clipboardActive ? " phone-copied-panel__status--active" : ""}`}>
            <IconPhoneCopiedStatus className="phone-copied-panel__status-icon" aria-hidden="true" />
            Copied to Clipboard
          </span>
        </div>
        <div className={`phone-copied-panel__number${clipboardActive ? " phone-copied-panel__number--active" : ""}`}>
          <IconCopiedPhoneHandset className="phone-copied-panel__phone-icon" aria-hidden="true" />
          {SUPER_ADMIN.phone}
        </div>
      </div>

      <div className="phone-copied-callout">
        <IconCopiedInfo className="phone-copied-callout__icon" aria-hidden="true" />
        <p className="phone-copied-callout__text">
          Use this number to contact the Super Administrator regarding your credential recovery request.
          Available Mon-Fri, 9AM-6PM.
        </p>
      </div>

      <div className="phone-copied-actions">
        <Link to={detailsTo} className="phone-copied-actions__primary">
          <IconCopiedContactView className="phone-copied-actions__icon" aria-hidden="true" />
          View Contact Details
        </Link>
        <Link to={closeTo} className="phone-copied-actions__secondary">
          Close
        </Link>
      </div>
    </FigmaModal>
  );
}

export function ViewContactDetailsModal({
  closeTo = "/contact-super-admin",
  cancelTo = "/phone-number-copied-successfully-modal",
}: {
  closeTo?: string;
  cancelTo?: string;
}) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const flashCopy = (type: "email" | "phone", text: string) => {
    copyToClipboard(text);
    if (type === "email") {
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1800);
      return;
    }
    setPhoneCopied(true);
    window.setTimeout(() => setPhoneCopied(false), 1800);
  };

  return (
    <FigmaModal
      onClose={closeTo}
      closeIcon={<img src={closeIcon} alt="" draggable={false} />}
      className="figma-modal--view-contact"
      footer={
        <>
          <Link to={cancelTo} className="view-contact-footer__cancel">
            Cancel
          </Link>
          <Link to={closeTo} className="view-contact-footer__close">
            Close Profile
          </Link>
        </>
      }
    >
      <div className="view-contact-layout">
        <aside className="view-contact-profile">
          <div className="view-contact-profile__photo-wrap">
            <img
              src={viewContactProfileAvatar}
              alt=""
              className="view-contact-profile__avatar"
              draggable={false}
            />
          </div>
          <h3 className="view-contact-profile__name">{SUPER_ADMIN.name}</h3>
          <p className="view-contact-profile__role">Super Administrator</p>
          <span className="view-contact-profile__badge">
            <IconContactDetailsAvailable className="view-contact-profile__badge-icon" aria-hidden="true" />
            Available
          </span>
        </aside>

        <div className="view-contact-main">
          <section className="view-contact-section">
            <h4 className="view-contact-section__title">Contact Information</h4>

            <div className="view-contact-row">
              <span className="view-contact-row__icon-wrap">
                <IconContactDetailsEmail className="view-contact-row__icon" aria-hidden="true" />
              </span>
              <div className="view-contact-row__content">
                <span className="view-contact-row__label">Email</span>
                <span className="view-contact-row__value">{SUPER_ADMIN.email}</span>
              </div>
              <div className="view-contact-row__actions">
                <button
                  type="button"
                  className={`view-contact-row__btn view-contact-row__btn--copy${emailCopied ? " view-contact-row__btn--copied" : ""}`}
                  onClick={() => flashCopy("email", SUPER_ADMIN.email)}
                >
                  <IconContactDetailsCopy className="view-contact-row__btn-icon" aria-hidden="true" />
                  {emailCopied ? "Copied" : "Copy"}
                </button>
                <a
                  href={`mailto:${SUPER_ADMIN.email}`}
                  className="view-contact-row__btn view-contact-row__btn--primary"
                >
                  <IconContactDetailsOpen className="view-contact-row__btn-icon" aria-hidden="true" />
                  Open
                </a>
              </div>
            </div>

            <div className="view-contact-row">
              <span className="view-contact-row__icon-wrap">
                <IconContactDetailsPhone className="view-contact-row__icon" aria-hidden="true" />
              </span>
              <div className="view-contact-row__content">
                <span className="view-contact-row__label">Phone</span>
                <span className="view-contact-row__value">{SUPER_ADMIN.phone}</span>
              </div>
              <div className="view-contact-row__actions">
                <button
                  type="button"
                  className={`view-contact-row__btn view-contact-row__btn--copy${phoneCopied ? " view-contact-row__btn--copied" : ""}`}
                  onClick={() => flashCopy("phone", SUPER_ADMIN.phone)}
                >
                  <IconContactDetailsCopy className="view-contact-row__btn-icon" aria-hidden="true" />
                  {phoneCopied ? "Copied" : "Copy"}
                </button>
                <Link to="/send-recovery-sms-modal" className="view-contact-row__btn view-contact-row__btn--primary">
                  <IconContactDetailsSms className="view-contact-row__btn-icon" aria-hidden="true" />
                  Send SMS
                </Link>
              </div>
            </div>

            <div className="view-contact-row">
              <span className="view-contact-row__icon-wrap">
                <IconContactDetailsClock className="view-contact-row__icon" aria-hidden="true" />
              </span>
              <div className="view-contact-row__content">
                <span className="view-contact-row__label">Availability</span>
                <span className="view-contact-row__value">Mon-Fri, 9AM-6PM</span>
                <span className="view-contact-row__sub">Standard operating hours</span>
              </div>
            </div>
          </section>

          <section className="view-contact-section">
            <h4 className="view-contact-section__title">Administrative Context</h4>
            <div className="view-contact-context">
              <div className="view-contact-context-card">
                <div className="view-contact-context-card__head">
                  <span className="view-contact-context-card__icon-wrap">
                    <IconContactDetailsShieldUser
                      className="view-contact-context-card__icon"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="view-contact-context-card__label">Status Mode</span>
                </div>
                <p className="view-contact-context-card__value">Enterprise Recovery Mode</p>
              </div>
              <div className="view-contact-context-card">
                <div className="view-contact-context-card__head">
                  <span className="view-contact-context-card__icon-wrap">
                    <IconContactDetailsShieldCheck
                      className="view-contact-context-card__icon"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="view-contact-context-card__label">Active Protocol</span>
                </div>
                <p className="view-contact-context-card__value">Security Protocol v4.2.0</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </FigmaModal>
  );
}
