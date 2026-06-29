import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import { PortalErrorState } from "./PortalErrorState";
import UserRegisteredSuccessModal from "./UserRegisteredSuccessModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import registerUserHeaderIcon from "../../icons/register-user-modal-header.svg";
import registerUserAccountIcon from "../../icons/register-user-account-icon.svg";
import registerUserPersonalIcon from "../../icons/register-user-personal-icon.svg";
import editUserContactIcon from "../../icons/edit-user-contact-icon.svg";
import {
  buildRegisteredUserSummary,
  type RegisteredUserSummary,
} from "../../utils/registerUserDisplay";
import { USER_REGISTRATION_ASSIGNED_ORGANIZATION } from "../../data/demoUserRegistration";
import "../../styles/register-user-modal.css";

const ASSIGNED_ORGANIZATION_NAME = USER_REGISTRATION_ASSIGNED_ORGANIZATION.name;

export const DEFAULT_USER_PASSWORD = "user123";

export type RegisterUserRole = "administrator" | "manager" | "support" | "user";

export type RegisterUserFormData = {
  username: string;
  defaultPassword: string;
  adminContactEmail: string;
  adminContactPhone: string;
  department: string;
  company: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  role: RegisterUserRole;
  accountActive: boolean;
  sendWelcomeEmail: boolean;
  requirePasswordChange: boolean;
};

type Props = {
  closeTo?: string;
  confirmTo?: string;
  assignedOrganization?: string;
  departmentOptions?: string[];
  adminContactDefaults?: {
    email?: string;
    phone?: string;
  };
  onClose?: () => void;
  onConfirm?: () => void;
  onDone?: () => void;
  onSubmit?: (data: RegisterUserFormData) => void | Promise<Partial<RegisteredUserSummary> | void>;
};

const FORM_ID = "register-user-form";

type FieldName = keyof Pick<
  RegisterUserFormData,
  "username" | "adminContactEmail" | "adminContactPhone" | "department" | "firstName" | "lastName"
>;

const buildInitialForm = (
  organization: string,
  adminContact?: { email?: string; phone?: string },
): RegisterUserFormData => ({
  username: "",
  defaultPassword: DEFAULT_USER_PASSWORD,
  adminContactEmail: adminContact?.email?.trim() ?? "",
  adminContactPhone: adminContact?.phone?.trim() ?? "",
  department: "",
  company: organization,
  firstName: "",
  middleInitial: "",
  lastName: "",
  role: "user",
  accountActive: false,
  sendWelcomeEmail: false,
  requirePasswordChange: true,
});

function SectionIcon({ type }: { type: "account" | "personal" | "contact" }) {
  const icons = {
    account: registerUserAccountIcon,
    personal: registerUserPersonalIcon,
    contact: editUserContactIcon,
  };

  return (
    <img
      src={icons[type]}
      alt=""
      aria-hidden="true"
      className={`register-user__section-icon-img register-user__section-icon-img--${type}`}
    />
  );
}

function SectionHead({ title, icon }: { title: string; icon: "account" | "personal" | "contact" }) {
  return (
    <div className="register-user__section-head">
      <span className="register-user__section-icon">
        <SectionIcon type={icon} />
      </span>
      <h3 className="register-user__section-title">{title}</h3>
      <span className="register-user__section-line" aria-hidden="true" />
    </div>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.25 7.25V5.5C5.25 4.01 6.51 2.75 8 2.75C9.49 2.75 10.75 4.01 10.75 5.5V7.25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect x="4.25" y="7.25" width="7.5" height="5.75" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconDoubleChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 4.5L7 7.5L10.5 4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 7.5L7 10.5L10.5 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function validateForm(data: RegisterUserFormData) {
  const fieldErrors: Partial<Record<FieldName, string>> = {};
  const phonePattern = /^(09\d{9}|63\d{10})$/;

  if (!data.username.trim()) {
    fieldErrors.username = "Username is required.";
  } else if (data.username.trim().length < 3) {
    fieldErrors.username = "Username must be at least 3 characters.";
  }

  if (data.adminContactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminContactEmail.trim())) {
    fieldErrors.adminContactEmail = "Enter a valid email address.";
  }

  if (data.adminContactPhone.trim() && !phonePattern.test(data.adminContactPhone.trim())) {
    fieldErrors.adminContactPhone = "Use a valid PH number, like 639123456789 or 09123456789.";
  }

  if (!data.department.trim()) {
    fieldErrors.department = "Department is required.";
  }

  if (!data.firstName.trim()) {
    fieldErrors.firstName = "First name is required.";
  }

  if (!data.lastName.trim()) {
    fieldErrors.lastName = "Last name is required.";
  }

  return {
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
  };
}

export default function RegisterUserModal({
  closeTo,
  confirmTo,
  assignedOrganization = ASSIGNED_ORGANIZATION_NAME,
  departmentOptions = [],
  adminContactDefaults,
  onClose,
  onConfirm,
  onDone,
  onSubmit,
}: Props) {
  const navigate = useNavigate();
  const organizationName = assignedOrganization || ASSIGNED_ORGANIZATION_NAME;
  const [formData, setFormData] = useState<RegisterUserFormData>(() =>
    buildInitialForm(organizationName, adminContactDefaults),
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredSummary, setRegisteredSummary] = useState<RegisteredUserSummary | null>(null);
  const [step, setStep] = useState<"form" | "success">("form");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      company: organizationName,
      adminContactEmail: prev.adminContactEmail || adminContactDefaults?.email?.trim() || "",
      adminContactPhone: prev.adminContactPhone || adminContactDefaults?.phone?.trim() || "",
    }));
  }, [organizationName, adminContactDefaults?.email, adminContactDefaults?.phone]);

  const updateFormField = <K extends keyof RegisterUserFormData>(name: K, value: RegisterUserFormData[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearFieldError = (name: FieldName) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const updateTextField = (name: FieldName, value: string) => {
    updateFormField(name, value);
    clearFieldError(name);
  };

  const updatePhoneField = (value: string) => {
    updateTextField("adminContactPhone", value.replace(/\D/g, "").slice(0, 12));
  };

  const handleDone = () => {
    if (onDone) {
      onDone();
      return;
    }

    if (onClose) {
      onClose();
      return;
    }

    if (onConfirm) {
      onConfirm();
      return;
    }

    if (confirmTo) {
      navigate(confirmTo);
    }
  };

  const completeRegistration = async () => {
    const submissionData: RegisterUserFormData = {
      ...formData,
      company: organizationName,
      defaultPassword: DEFAULT_USER_PASSWORD,
    };
    let summary = buildRegisteredUserSummary(submissionData);

    if (onSubmit) {
      try {
        const result = await onSubmit(submissionData);
        if (result) {
          summary = buildRegisteredUserSummary(submissionData, result);
        }
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Registration failed. Check the form and try again.";
        setSubmitError(message);
        return;
      }
    }

    setRegisteredSummary(summary);
    setStep("success");
  };

  const handleRegister = () => {
    const validation = validateForm(formData);
    setFieldErrors(validation.fieldErrors);
    setShowValidation(true);
    setSubmitError(null);

    if (!validation.isValid) return;

    void completeRegistration();
  };

  if (step === "success" && registeredSummary) {
    return (
      <UserRegisteredSuccessModal
        summary={registeredSummary}
        onDone={handleDone}
      />
    );
  }

  const registerButton = (
    <button
      type="button"
      form={FORM_ID}
      className="figma-btn figma-btn--primary register-user__activate-btn"
      onClick={handleRegister}
    >
      Register User
    </button>
  );

  const footer = onClose ? (
    <>
      <button type="button" className="register-user__cancel-btn" onClick={onClose}>
        Cancel
      </button>
      {registerButton}
    </>
  ) : (
    <>
      <Link to={closeTo!} className="register-user__cancel-btn">
        Cancel
      </Link>
      {registerButton}
    </>
  );

  return (
    <FigmaModal
      className="figma-modal--register-user"
      title="Register New User"
      subtitle="Create a new user account for your organization. The user must activate their account before signing in."
      headerIcon={<img src={registerUserHeaderIcon} alt="" aria-hidden="true" />}
      wide
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="register-user__footer"
    >
      <form id={FORM_ID} className="register-user__form" onSubmit={(event) => event.preventDefault()}>
        <p className="register-user__notice">
          Default password reminder: Users are registered with{" "}
          <strong>{DEFAULT_USER_PASSWORD}</strong>. Share this with the account holder after registration.
        </p>
        {submitError ? (
          <PortalErrorState variant="error" title="Registration Failed" message={submitError} compact />
        ) : null}

        <section className="register-user__section">
          <SectionHead title="Account Information" icon="account" />

          <div className="register-user__section-body">
            <div className="register-user__grid register-user__grid--account">
              <div className="register-user__field register-user__field--full">
                <label className="register-user__label" htmlFor="register-username">
                  Username
                </label>
                <div
                  className={`register-user__input-wrap${showValidation && fieldErrors.username ? " register-user__input-wrap--error" : ""}`}
                >
                  <input
                    id="register-username"
                    name="username"
                    className="register-user__input"
                    autoComplete="username"
                    value={formData.username}
                    onChange={(event) => updateTextField("username", event.target.value)}
                  />
                </div>
                {showValidation && fieldErrors.username ? (
                  <p className="register-user__field-error">{fieldErrors.username}</p>
                ) : null}
              </div>

              <div className="register-user__field register-user__field--password">
                <label className="register-user__label" htmlFor="register-default-password">
                  Default Password
                </label>
                <div className="register-user__input-wrap register-user__input-wrap--readonly">
                  <input
                    id="register-default-password"
                    name="defaultPassword"
                    className="register-user__input register-user__input--readonly"
                    type="text"
                    readOnly
                    aria-readonly="true"
                    value={DEFAULT_USER_PASSWORD}
                  />
                </div>
                <p className="register-user__password-rules">
                  Default password is {DEFAULT_USER_PASSWORD} (pre-filled).
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="register-user__section register-user__section--personal">
          <SectionHead title="Personal Information" icon="personal" />

          <div className="register-user__section-body">
            <div className="register-user__name-grid">
              <div className="register-user__field">
                <label className="register-user__label" htmlFor="register-first-name">
                  First Name
                </label>
                <div
                  className={`register-user__input-wrap${showValidation && fieldErrors.firstName ? " register-user__input-wrap--error" : ""}`}
                >
                  <input
                    id="register-first-name"
                    name="firstName"
                    className="register-user__input"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={(event) => updateTextField("firstName", event.target.value)}
                  />
                </div>
                {showValidation && fieldErrors.firstName ? (
                  <p className="register-user__field-error">{fieldErrors.firstName}</p>
                ) : null}
              </div>

              <div className="register-user__field register-user__field--mi">
                <label className="register-user__label" htmlFor="register-middle-initial">
                  M.I.
                </label>
                <div className="register-user__input-wrap">
                  <input
                    id="register-middle-initial"
                    name="middleInitial"
                    className="register-user__input"
                    autoComplete="additional-name"
                    value={formData.middleInitial}
                    maxLength={1}
                    onChange={(event) =>
                      updateFormField(
                        "middleInitial",
                        event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 1),
                      )
                    }
                  />
                </div>
              </div>

              <div className="register-user__field">
                <label className="register-user__label" htmlFor="register-last-name">
                  Last Name
                </label>
                <div
                  className={`register-user__input-wrap${showValidation && fieldErrors.lastName ? " register-user__input-wrap--error" : ""}`}
                >
                  <input
                    id="register-last-name"
                    name="lastName"
                    className="register-user__input"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={(event) => updateTextField("lastName", event.target.value)}
                  />
                </div>
                {showValidation && fieldErrors.lastName ? (
                  <p className="register-user__field-error">{fieldErrors.lastName}</p>
                ) : null}
              </div>
            </div>

            <div className="register-user__grid register-user__grid--account register-user__locked-row">
              <div className="register-user__field">
                <label className="register-user__label" htmlFor="register-department">
                  Department
                </label>
                <div
                  className={`register-user__input-wrap${showValidation && fieldErrors.department ? " register-user__input-wrap--error" : ""}`}
                >
                  {departmentOptions.length > 0 ? (
                    <div className="register-user__select-wrap">
                      <select
                        id="register-department"
                        name="department"
                        className="register-user__input register-user__input--select"
                        value={formData.department}
                        onChange={(event) => updateTextField("department", event.target.value)}
                      >
                        <option value="">Select department</option>
                        {departmentOptions.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                      <span className="register-user__select-icon" aria-hidden="true">
                        <IconDoubleChevronDown />
                      </span>
                    </div>
                  ) : (
                    <input
                      id="register-department"
                      name="department"
                      className="register-user__input"
                      value={formData.department}
                      onChange={(event) => updateTextField("department", event.target.value)}
                    />
                  )}
                </div>
                {showValidation && fieldErrors.department ? (
                  <p className="register-user__field-error">{fieldErrors.department}</p>
                ) : null}
              </div>

              <div className="register-user__field">
                <label className="register-user__label" htmlFor="register-company">
                  Organization
                </label>
                <div className="register-user__input-wrap register-user__input-wrap--locked">
                  <input
                    id="register-company"
                    name="company"
                    className="register-user__input register-user__input--readonly"
                    readOnly
                    aria-readonly="true"
                    tabIndex={-1}
                    value={organizationName}
                  />
                  <span className="register-user__lock-icon" aria-hidden="true">
                    <IconLock />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="register-user__section register-user__section--contact">
          <SectionHead title="Admin Contact Information" icon="contact" />

          <div className="register-user__section-body">
            <p className="register-user__section-note">
              These are your administrator contact details. Registered users will see them when they
              need help with credentials or access. Users add their own contact information separately
              in Account Settings.
            </p>
            <div className="register-user__grid register-user__grid--account">
              <div className="register-user__field">
                <label className="register-user__label" htmlFor="register-admin-email">
                  Admin Email
                </label>
                <div
                  className={`register-user__input-wrap${showValidation && fieldErrors.adminContactEmail ? " register-user__input-wrap--error" : ""}`}
                >
                  <input
                    id="register-admin-email"
                    name="adminContactEmail"
                    type="email"
                    className="register-user__input"
                    autoComplete="email"
                    placeholder="Enter your admin email for user support"
                    value={formData.adminContactEmail}
                    onChange={(event) => updateTextField("adminContactEmail", event.target.value)}
                  />
                </div>
                {showValidation && fieldErrors.adminContactEmail ? (
                  <p className="register-user__field-error">{fieldErrors.adminContactEmail}</p>
                ) : null}
              </div>

              <div className="register-user__field">
                <label className="register-user__label" htmlFor="register-admin-phone">
                  Admin Phone
                </label>
                <div
                  className={`register-user__input-wrap${showValidation && fieldErrors.adminContactPhone ? " register-user__input-wrap--error" : ""}`}
                >
                  <input
                    id="register-admin-phone"
                    name="adminContactPhone"
                    type="tel"
                    className="register-user__input"
                    autoComplete="tel"
                    inputMode="numeric"
                    placeholder="Enter your admin phone for user support"
                    value={formData.adminContactPhone}
                    onChange={(event) => updatePhoneField(event.target.value)}
                  />
                </div>
                {showValidation && fieldErrors.adminContactPhone ? (
                  <p className="register-user__field-error">{fieldErrors.adminContactPhone}</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </form>
    </FigmaModal>
  );
}
