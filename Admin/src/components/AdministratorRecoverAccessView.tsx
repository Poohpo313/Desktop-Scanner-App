import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { storeRecoveryRequest } from "../lib/recoverySession";
import recoverAccessKeyIcon from "../icons/recover-access-key-icon.png";
import "../styles/admin-recover-access.css";

const NAVIGATION_DELAY_MS = 400;
type ContactMethod = "email" | "sms" | "physical";

const CONTACT_METHODS: Array<{
  id: ContactMethod;
  title: string;
  description: string;
}> = [
  {
    id: "email",
    title: "Contact through Email",
    description: "The System Administrator's email address is provided for your concerns.",
  },
  {
    id: "sms",
    title: "Contact through SMS",
    description: "The System Administrator's phone number is provided for your concerns.",
  },
  {
    id: "physical",
    title: "Ask Admin Physically",
    description: "Approach your System Administrator to receive printed or written access details.",
  },
];

type Props = {
  loginHref?: string;
  emailConfirmHref?: string;
  smsConfirmHref?: string;
};

export default function AdministratorRecoverAccessView({
  loginHref = "/admin-login",
  emailConfirmHref = "/admin-email-recovery-confirmation",
  smsConfirmHref = "/admin-sms-recovery-confirmation",
}: Props) {
  const navigate = useNavigate();
  const navigateTimeoutRef = useRef<number | null>(null);
  const [method, setMethod] = useState<ContactMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onMethodChange = (next: ContactMethod) => {
    if (navigateTimeoutRef.current !== null) {
      window.clearTimeout(navigateTimeoutRef.current);
      navigateTimeoutRef.current = null;
    }

    setMethod(next);
    setError("");

    const href =
      next === "physical"
        ? loginHref
        : next === "email"
          ? emailConfirmHref
          : next === "sms"
            ? smsConfirmHref
            : null;

    if (!href) {
      return;
    }

    const go = () => {
      navigate(href);
      navigateTimeoutRef.current = null;
    };

    if (next === "physical") {
      navigateTimeoutRef.current = window.setTimeout(go, NAVIGATION_DELAY_MS);
      return;
    }

    setSubmitting(true);
    void authApi
      .submitRecovery({
        identifier: "admin-portal-recovery",
        channel: next,
      })
      .then((result) => {
        storeRecoveryRequest({
          requestId: result.requestId,
          submittedAt: result.submittedAt,
        });
        navigateTimeoutRef.current = window.setTimeout(go, NAVIGATION_DELAY_MS);
      })
      .catch(() => {
        setError("Could not submit recovery request. Try again or contact support.");
        setMethod(null);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  useEffect(() => {
    document.body.classList.add("admin-recover-access-page");
    return () => {
      document.body.classList.remove("admin-recover-access-page");
      if (navigateTimeoutRef.current !== null) {
        window.clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="admin-recover-access">
      <div className="admin-recover-access__card">
        <div className="admin-recover-access__icon-wrap">
          <span className="admin-recover-access__icon-glow" aria-hidden="true" />
          <div className="admin-recover-access__icon-badge">
            <img
              src={recoverAccessKeyIcon}
              alt=""
              className="admin-recover-access__key-icon"
              aria-hidden="true"
              draggable={false}
            />
          </div>
        </div>

        <h1 className="admin-recover-access__title">Need Account Access?</h1>
        <p className="admin-recover-access__intro">
          Your username and serial key are assigned by your System Administrator.
          <br />
          Choose how you want to request or receive your access details.
        </p>

        <fieldset className="admin-recover-access__methods">
          <legend className="admin-recover-access__methods-label">Contact Method</legend>
          {error && (
            <p className="admin-recover-access__error" role="alert">
              {error}
            </p>
          )}
          <div className="admin-recover-access__options" role="radiogroup" aria-label="Contact Method">
            {CONTACT_METHODS.map((option) => {
              const selected = method === option.id;
              return (
                <label
                  key={option.id}
                  className={`admin-recover-access__option${selected ? " admin-recover-access__option--selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="contact-method"
                    value={option.id}
                    checked={selected}
                    disabled={submitting}
                    onChange={() => onMethodChange(option.id)}
                  />
                  <span className="admin-recover-access__option-text">
                    <span className="admin-recover-access__option-title">{option.title}</span>
                    <span className="admin-recover-access__option-desc">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <Link className="admin-recover-access__return" to={loginHref}>
          Return to login
        </Link>
      </div>
    </div>
  );
}
