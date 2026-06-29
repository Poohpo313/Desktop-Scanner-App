import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import AuthPanelHeader from "../components/AuthPanelHeader";
import RecoveryMethodOption from "../components/RecoveryMethodOption";
import "../styles/recover-admin.css";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidPhone = (value: string) =>
  /^(09\d{9}|639\d{9})$/.test(value);

type RecoveryMethod = "" | "email" | "phone" | "alternative";

const recoveryFieldByMethod = {
  "": {
    label: "Admin Email",
    placeholder: "Enter Admin Email",
    icon: "/assets/Mail-Logo.svg",
    type: "email",
    inputMode: "email",
  },
  email: {
    label: "Admin Email",
    placeholder: "Enter Admin Email",
    icon: "/assets/Mail-Logo.svg",
    type: "email",
    inputMode: "email",
  },
  phone: {
    label: "Admin Phone Number",
    placeholder: "Enter Admin Phone Number",
    icon: "/assets/Phone-Logo.svg",
    type: "tel",
    inputMode: "numeric",
  },
  alternative: {
    label: "Admin Email",
    placeholder: "Enter Backup Admin Email",
    icon: "/assets/Mail-Logo.svg",
    type: "email",
    inputMode: "email",
  },
} as const;

export default function RecoverAdmin() {
  const [credential, setCredential] = useState("");
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const isPhoneMethod = recoveryMethod === "phone";
  const recoveryField = recoveryFieldByMethod[recoveryMethod];

  const selectRecoveryMethod = (method: RecoveryMethod) => {
    setRecoveryMethod(method);
    setCredential("");
    setError("");
  };

  const sanitizeCredentialInput = (value: string) => {
    if (isPhoneMethod) {
      return value.replace(/\D/g, "").slice(0, 12);
    }

    return value.replace(/[^a-zA-Z0-9@._+-]/g, "");
  };

  const submitRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCredential = credential.trim();
    const isValidCredential = isPhoneMethod
      ? isValidPhone(trimmedCredential)
      : isValidEmail(trimmedCredential);

    if (!recoveryMethod) {
      setError("Select a recovery method");
      return;
    }

    if (!isValidCredential) {
      setError("Please enter Valid Credentials");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await authApi.submitRecovery({
        identifier: trimmedCredential,
        channel: recoveryMethod,
      });
      navigate("/portal/email-confirmation");
    } catch {
      setError("Recovery request failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="recover-admin-page">
      <section className="recover-admin">
        <div className="recover-admin__header">
          <AuthPanelHeader
            iconSrc="/assets/Recover.svg"
            iconFrameClassName="recover-admin__icon-frame"
            title="Recover Administrator Access"
            subtitle="Enter your administrator email or username. A recovery code will be sent through your saved contact method."
            titleClassName="recover-admin__title"
            subtitleClassName="recover-admin__subtitle"
          />
        </div>

        <form className="recover-admin__form" onSubmit={submitRecovery} noValidate>
          <label className="recover-admin__label" htmlFor="recovery-identifier">
            {recoveryField.label}
          </label>
          <div className="recover-admin__input-wrap">
            <img src={recoveryField.icon} alt="" aria-hidden="true" />
            <input
              id="recovery-identifier"
              className="recover-admin__input"
              type={recoveryField.type}
              inputMode={recoveryField.inputMode}
              placeholder={recoveryField.placeholder}
              value={credential}
              onChange={(e) => {
                setCredential(sanitizeCredentialInput(e.target.value));
                if (error) setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "recovery-email-error" : undefined}
            />
          </div>
          {error && (
            <p className="recover-admin__error" id="recovery-email-error">
              {error}
            </p>
          )}

          <fieldset className="recover-admin__methods">
            <legend>Recovery Method</legend>

            <RecoveryMethodOption
              name="recovery-method"
              checked={recoveryMethod === "email"}
              label="Recovery Email"
              maskedValue="**********@gmail.com"
              onChange={() => selectRecoveryMethod("email")}
            />

            <RecoveryMethodOption
              name="recovery-method"
              checked={recoveryMethod === "phone"}
              label="Phone Number"
              maskedValue="09**********"
              onChange={() => selectRecoveryMethod("phone")}
            />

            <RecoveryMethodOption
              name="recovery-method"
              checked={recoveryMethod === "alternative"}
              label="Alternative Contact"
              maskedValue="********@school.edu"
              onChange={() => selectRecoveryMethod("alternative")}
            />
          </fieldset>

          <button className="recover-admin__submit" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send Recovery Code"}
          </button>
        </form>

        <Link className="recover-admin__return" to="/portal/login" state={{ skipSplash: true }}>
          Return to login
        </Link>
      </section>
    </main>
  );
}
