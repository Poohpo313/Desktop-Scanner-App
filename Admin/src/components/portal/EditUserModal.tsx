import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import { IconUserMgmtEdit } from "../icons/UserManagementIcons";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import registerUserAccountIcon from "../../icons/register-user-account-icon.svg";
import registerUserPersonalIcon from "../../icons/register-user-personal-icon.svg";
import registerUserLicenseIcon from "../../icons/register-user-license-icon.svg";
import editUserContactIcon from "../../icons/edit-user-contact-icon.svg";
import { DEMO_ADMIN_USER } from "../../data/demoUsers";
import type { AdminUser } from "../../types";
import "../../styles/edit-user-modal.css";

export type EditUserProfileDefaults = {
  middleInitial?: string;
  department?: string;
  company?: string;
};

export type EditUserFormData = {
  username: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  department: string;
  company: string;
  assignedKey: string;
};

type Props = {
  user?: AdminUser | null;
  profile?: EditUserProfileDefaults;
  closeTo?: string;
  adminContactDefaults?: {
    email?: string;
    phone?: string;
  };
  onClose?: () => void;
  onSubmit?: (data: EditUserFormData) => void;
};

type FieldName = "username" | "firstName" | "lastName";

type ValidationResult = {
  fieldErrors: Partial<Record<FieldName, string>>;
  isValid: boolean;
};

const FORM_ID = "edit-user-form";
const FIGMA_LICENSE_KEY = "";

export function parseNameParts(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 3 && parts[1].replace(/\./g, "").length <= 2) {
    return {
      firstName: parts[0],
      middleInitial: parts[1].replace(/\./g, ""),
      lastName: parts.slice(2).join(" "),
    };
  }

  return {
    firstName: parts[0] ?? "",
    middleInitial: "",
    lastName: parts.slice(1).join(" "),
  };
}

function defaultEditValues(user?: AdminUser | null, profile?: EditUserProfileDefaults): EditUserFormData {
  const source = user ?? DEMO_ADMIN_USER;
  return {
    username: source.username ?? "",
    firstName: source.firstName ?? "",
    middleInitial: profile?.middleInitial ?? "",
    lastName: source.lastName ?? "",
    department: profile?.department ?? "",
    company: profile?.company ?? "",
    assignedKey: source.serialKey ?? FIGMA_LICENSE_KEY,
  };
}

function validateEditForm(data: EditUserFormData): ValidationResult {
  const fieldErrors: Partial<Record<FieldName, string>> = {};

  if (!data.username.trim()) {
    fieldErrors.username = "Username is required.";
  } else if (data.username.trim().length < 3) {
    fieldErrors.username = "Username must be at least 3 characters.";
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

function readFormData(initial: EditUserFormData): EditUserFormData | null {
  const form = document.getElementById(FORM_ID) as HTMLFormElement | null;
  if (!form) return null;
  const data = new FormData(form);
  return {
    username: String(data.get("username") ?? ""),
    firstName: String(data.get("firstName") ?? ""),
    middleInitial: String(data.get("middleInitial") ?? ""),
    lastName: String(data.get("lastName") ?? ""),
    department: initial.department,
    company: initial.company,
    assignedKey: initial.assignedKey,
  };
}

function SectionIcon({ type }: { type: "account" | "personal" | "contact" | "license" }) {
  const icons = {
    account: registerUserAccountIcon,
    personal: registerUserPersonalIcon,
    contact: editUserContactIcon,
    license: registerUserLicenseIcon,
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

function SectionHead({ title, icon }: { title: string; icon: "account" | "personal" | "contact" | "license" }) {
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

function TextField({
  label,
  id,
  name,
  type = "text",
  fullWidth = false,
  defaultValue = "",
  error,
  onValueChange,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  fullWidth?: boolean;
  defaultValue?: string;
  error?: string;
  onValueChange?: () => void;
}) {
  return (
    <div className={`register-user__field${fullWidth ? " register-user__field--full" : ""}`}>
      <label className="register-user__label" htmlFor={id}>
        {label}
      </label>
      <div className={`register-user__input-wrap${error ? " register-user__input-wrap--error" : ""}`}>
        <input
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue}
          className="register-user__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={onValueChange}
        />
      </div>
      {error ? (
        <p className="register-user__field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReadOnlyField({
  label,
  id,
  value,
  multiline = false,
}: {
  label: string;
  id: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="register-user__field">
      <label className="register-user__label" htmlFor={id}>
        {label}
      </label>
      <div
        className={`register-user__input-wrap register-user__input-wrap--locked${
          multiline ? " register-user__input-wrap--locked-multiline" : ""
        }`}
      >
        {multiline ? (
          <div id={id} className="register-user__input register-user__readonly-value" role="textbox" aria-readonly="true">
            {value}
          </div>
        ) : (
          <input id={id} name={id} className="register-user__input" value={value} readOnly tabIndex={-1} />
        )}
        <span className="edit-user__lock-icon" aria-hidden="true">
          <IconLock />
        </span>
      </div>
    </div>
  );
}

export default function EditUserModal({
  user,
  profile,
  closeTo,
  adminContactDefaults,
  onClose,
  onSubmit,
}: Props) {
  const navigate = useNavigate();
  const initial = defaultEditValues(user, profile);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [formKey, setFormKey] = useState(user?.userId ?? "demo");

  useEffect(() => {
    setFieldErrors({});
    setShowValidation(false);
    setFormKey(user?.userId ?? "demo");
  }, [user, profile]);

  const clearFieldError = (name: FieldName) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = () => {
    const data = readFormData(initial);
    if (!data) return;

    const validation = validateEditForm(data);
    setFieldErrors(validation.fieldErrors);
    setShowValidation(true);

    if (!validation.isValid) return;

    if (onSubmit) {
      onSubmit(data);
      return;
    }

    if (onClose) {
      onClose();
      return;
    }

    if (closeTo) {
      navigate(closeTo);
    }
  };

  const footer = onClose ? (
    <>
      <button type="button" className="edit-user__cancel-btn" onClick={onClose}>
        Cancel
      </button>
      <button type="button" form={FORM_ID} className="figma-btn figma-btn--primary edit-user__save-btn" onClick={handleSubmit}>
        Save Changes
      </button>
    </>
  ) : (
    <>
      <Link to={closeTo!} className="edit-user__cancel-btn">
        Cancel
      </Link>
      <button type="button" form={FORM_ID} className="figma-btn figma-btn--primary edit-user__save-btn" onClick={handleSubmit}>
        Save Changes
      </button>
    </>
  );

  return (
    <FigmaModal
      className="figma-modal--register-user figma-modal--edit-user"
      title="Edit User Information"
      headerIcon={<IconUserMgmtEdit className="edit-user__header-icon" aria-hidden="true" />}
      wide
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="edit-user__footer"
    >
      <form id={FORM_ID} key={formKey} className="register-user__form edit-user__form" onSubmit={(event) => event.preventDefault()}>
        <section className="register-user__section">
          <SectionHead title="Account Information" icon="account" />
          <div className="register-user__section-body">
            <div className="register-user__grid register-user__grid--account">
              <TextField
                label="Username"
                id="edit-username"
                name="username"
                fullWidth
                defaultValue={initial.username}
                error={showValidation ? fieldErrors.username : undefined}
                onValueChange={() => clearFieldError("username")}
              />
            </div>
          </div>
        </section>

        <section className="register-user__section register-user__section--personal">
          <SectionHead title="Personal Information" icon="personal" />
          <div className="register-user__section-body">
            <div className="register-user__name-grid">
              <TextField
                label="First Name"
                id="edit-first-name"
                name="firstName"
                defaultValue={initial.firstName}
                error={showValidation ? fieldErrors.firstName : undefined}
                onValueChange={() => clearFieldError("firstName")}
              />
              <TextField
                label="M.I."
                id="edit-middle-initial"
                name="middleInitial"
                defaultValue={initial.middleInitial}
              />
              <TextField
                label="Last Name"
                id="edit-last-name"
                name="lastName"
                defaultValue={initial.lastName}
                error={showValidation ? fieldErrors.lastName : undefined}
                onValueChange={() => clearFieldError("lastName")}
              />
            </div>
            <div className="register-user__grid register-user__grid--account edit-user__locked-row">
              <ReadOnlyField label="Department" id="edit-department" value={initial.department} />
              <ReadOnlyField label="Organization" id="edit-company" value={initial.company} multiline />
            </div>
          </div>
        </section>

        <section className="register-user__section register-user__section--contact">
          <SectionHead title="Admin Contact Information" icon="contact" />
          <div className="register-user__section-body">
            <p className="register-user__section-note">
              These administrator details are shown to users who need support. Update them in Settings
              if they change.
            </p>
            <div className="register-user__grid register-user__grid--account">
              <ReadOnlyField
                label="Admin Email"
                id="edit-admin-email"
                value={adminContactDefaults?.email?.trim() || "—"}
              />
              <ReadOnlyField
                label="Admin Phone"
                id="edit-admin-phone"
                value={adminContactDefaults?.phone?.trim() || "—"}
              />
            </div>
          </div>
        </section>

        <section className="register-user__section register-user__section--license">
          <SectionHead title="Serial Assignment" icon="license" />
          <div className="register-user__section-body">
            <div className="register-user__field edit-user__key-field">
              <label className="register-user__label" htmlFor="edit-assigned-key">
                Assigned Key
              </label>
              <div className="register-user__input-wrap register-user__input-wrap--key">
                <input
                  id="edit-assigned-key"
                  name="assignedKey"
                  className="register-user__input"
                  value={initial.assignedKey}
                  readOnly
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>
        </section>
      </form>
    </FigmaModal>
  );
}
