import { useEffect, useState, type FormEvent } from "react";
import { adminsApi } from "../api/admins.api";
import { authApi } from "../api/auth.api";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import { AdminRegisteredSuccessModal } from "../components/AdminRegisteredSuccessModal";
import { extractApiError } from "../lib/extractApiError";
import { useNotificationStore } from "../store/notificationStore";
import type { AdminAccount, AdminUser, SerialKey } from "../types";
import "../styles/RegistrationEdit.css";

export type RegistrationEditMode = "user" | "administrator";

export type RegistrationEditTarget =
  | { kind: "user"; record: AdminUser }
  | { kind: "administrator"; record: AdminAccount };

type RegistrationForm = {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  department: string;
  company: string;
  email: string;
  phoneNumber: string;
};

type RegistrationErrors = Partial<Record<keyof RegistrationForm | "assignedKey", string>>;

type Props = {
  availableKey: SerialKey | null;
  departmentOptions: string[];
  companyOptions: string[];
  mode: RegistrationEditMode;
  editTarget?: RegistrationEditTarget | null;
  adminContactDefaults?: {
    email?: string;
    phone?: string;
  };
  onClose: () => void;
  onRegistered: () => Promise<void> | void;
};

const defaultPasswordForMode = (mode: RegistrationEditMode) =>
  mode === "user" ? "user123" : "admin123";

const emptyForm = (
  mode: RegistrationEditMode,
  adminContact?: { email?: string; phone?: string },
): RegistrationForm => ({
  username: "",
  password: defaultPasswordForMode(mode),
  confirmPassword: defaultPasswordForMode(mode),
  firstName: "",
  middleInitial: "",
  lastName: "",
  department: "",
  company: "",
  email: mode === "user" ? adminContact?.email?.trim() ?? "" : "",
  phoneNumber: mode === "user" ? adminContact?.phone?.trim() ?? "" : "",
});

const sanitizeRegistrationField = (field: keyof RegistrationForm, value: string) => {
  if (field === "firstName" || field === "lastName") {
    return value.replace(/[^a-zA-Z\s'-]/g, "");
  }

  if (field === "middleInitial") {
    return value.replace(/[^a-zA-Z]/g, "").slice(0, 1);
  }

  if (field === "phoneNumber") {
    return value.replace(/\D/g, "").slice(0, 12);
  }

  return value;
};

function formFromTarget(
  target: RegistrationEditTarget,
  adminContact?: { email?: string; phone?: string },
): RegistrationForm {
  if (target.kind === "user") {
    const record = target.record;
    return {
      username: record.username ?? "",
      password: "",
      confirmPassword: "",
      firstName: record.firstName ?? "",
      middleInitial:
        ((record as AdminUser & { middleInitial?: string }).middleInitial ?? "") || "",
      lastName: record.lastName ?? "",
      department:
        ((record as AdminUser & { department?: string }).department ?? "") || "",
      company:
        ((record as AdminUser & { company?: string; organization?: string }).company ??
          (record as AdminUser & { organization?: string }).organization ??
          "") || "",
      email: adminContact?.email?.trim() ?? "",
      phoneNumber: adminContact?.phone?.trim() ?? "",
    };
  }

  const record = target.record;
  return {
    username: record.username ?? "",
    password: "",
    confirmPassword: "",
    firstName: record.firstName ?? "",
    middleInitial:
      ((record as AdminAccount & { middleInitial?: string }).middleInitial ?? "") || "",
    lastName: record.lastName ?? "",
    department:
      ((record as AdminAccount & { department?: string }).department ?? "") || "",
    company:
      ((record as AdminAccount & { company?: string; organization?: string }).company ??
        (record as AdminAccount & { organization?: string }).organization ??
        "") || "",
    email: record.email ?? "",
    phoneNumber: record.phoneNumber ?? "",
  };
}

async function syncSuperAdminContactProfile(email: string, phoneNumber: string) {
  const nextEmail = email.trim();
  const nextPhone = phoneNumber.trim();
  if (!nextEmail && !nextPhone) return;

  const current = await authApi.me();
  if (
    nextEmail === (current.email ?? "").trim() &&
    nextPhone === (current.phoneNumber ?? "").trim()
  ) {
    return;
  }

  await authApi.updateProfile({
    email: nextEmail || undefined,
    phoneNumber: nextPhone || undefined,
  });
}

export default function RegistrationEdit({
  availableKey,
  departmentOptions,
  companyOptions,
  mode,
  editTarget = null,
  adminContactDefaults,
  onClose,
  onRegistered,
}: Props) {
  const [form, setForm] = useState<RegistrationForm>(() =>
    editTarget
      ? formFromTarget(editTarget, adminContactDefaults)
      : emptyForm(mode, adminContactDefaults),
  );
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [assignedKey, setAssignedKey] = useState<SerialKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredAdminUsername, setRegisteredAdminUsername] = useState<string | null>(null);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(() => {
    if (editTarget?.kind === "administrator") {
      const record = editTarget.record as AdminAccount & { departments?: string[] };
      if (record.departments?.length) return [...record.departments];
      if (record.department) return [record.department];
    }
    return [];
  });
  const push = useNotificationStore((state) => state.push);
  const isUser = mode === "user";
  const isEditing = Boolean(editTarget);

  useEffect(() => {
    if (!isUser || editTarget) return;

    void authApi.me().then((profile) => {
      setForm((current) => ({
        ...current,
        email: current.email || profile.email?.trim() || adminContactDefaults?.email?.trim() || "",
        phoneNumber:
          current.phoneNumber ||
          profile.phoneNumber?.trim() ||
          adminContactDefaults?.phone?.trim() ||
          "",
      }));
    });
  }, [adminContactDefaults?.email, adminContactDefaults?.phone, editTarget, isUser]);

  const title = isEditing
    ? isUser
      ? "Edit User"
      : "Edit Administrator"
    : isUser
      ? "Register New User"
      : "Register New Admin";
  const submitText = isEditing
    ? isUser
      ? "Save User"
      : "Save Administrator"
    : isUser
      ? "Register User"
      : "Register Admin";
  const contactTitle = "Admin Contact Information";
  const contactReadOnly = isUser && isEditing;

  const updateField = (field: keyof RegistrationForm, value: string) => {
    const sanitizedValue = sanitizeRegistrationField(field, value);

    setForm((current) => ({ ...current, [field]: sanitizedValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const selectDepartment = (department: string) => {
    updateField("department", department);
    setDepartmentOpen(false);
  };

  const toggleAdminDepartment = (department: string) => {
    setSelectedDepartments((current) =>
      current.includes(department)
        ? current.filter((item) => item !== department)
        : [...current, department],
    );
    setErrors((current) => ({ ...current, department: undefined }));
  };

  const selectCompany = (company: string) => {
    updateField("company", company);
    setCompanyOpen(false);
  };

  const validate = () => {
    const nextErrors: RegistrationErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^(09\d{9}|63\d{10})$/;
    const usernamePattern = /^[a-zA-Z0-9._-]{3,32}$/;
    const namePattern = /^[a-zA-Z][a-zA-Z\s'-]{1,}$/;

    if (!usernamePattern.test(form.username.trim())) {
      nextErrors.username = "Use 3-32 letters, numbers, dots, dashes, or underscores.";
    }
    if (!isEditing) {
      if (form.password.length < 7) {
        nextErrors.password = "Password must be at least 7 characters.";
      }
    } else if (form.password && form.password.length < 7) {
      nextErrors.password = "Password must be at least 7 characters.";
    }
    if (!namePattern.test(form.firstName.trim())) {
      nextErrors.firstName = "Enter a valid first name.";
    }
    if (!namePattern.test(form.lastName.trim())) {
      nextErrors.lastName = "Enter a valid last name.";
    }
    if (form.middleInitial.trim() && !/^[a-zA-Z]$/.test(form.middleInitial.trim())) {
      nextErrors.middleInitial = "Use one letter.";
    }
    if (isUser) {
      if (!form.department.trim()) {
        nextErrors.department = "Enter a department.";
      }
    } else if (departmentOptions.length === 0) {
      if (!form.department.trim()) {
        nextErrors.department = "Enter a department.";
      }
    } else if (selectedDepartments.length === 0) {
      nextErrors.department = "Select at least one department.";
    }
    if (isUser && !form.company.trim()) {
      nextErrors.company = "Enter a company.";
    }
    if (!isUser) {
      if (!emailPattern.test(form.email.trim())) {
        nextErrors.email = "Enter a valid email address.";
      }
      if (!phonePattern.test(form.phoneNumber.trim())) {
        nextErrors.phoneNumber = "Use a valid PH number, like 639123456789 or 09123456789.";
      }
    } else {
      if (form.email.trim() && !emailPattern.test(form.email.trim())) {
        nextErrors.email = "Enter a valid email address.";
      }
      if (form.phoneNumber.trim() && !phonePattern.test(form.phoneNumber.trim())) {
        nextErrors.phoneNumber = "Use a valid PH number, like 639123456789 or 09123456789.";
      }
    }
    if (isUser && !isEditing && !assignedKey) {
      nextErrors.assignedKey = "Auto-assign an available license key.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const autoAssignKey = () => {
    if (!availableKey) {
      setErrors((current) => ({
        ...current,
        assignedKey: "No available serial key found.",
      }));
      return;
    }

    setAssignedKey(availableKey);
    setErrors((current) => ({ ...current, assignedKey: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      if (isEditing && editTarget) {
        const payload = {
          username: form.username.trim(),
          firstName: form.firstName.trim(),
          middleInitial: form.middleInitial.trim(),
          lastName: form.lastName.trim(),
          department: form.department,
          company: form.company.trim(),
          ...(form.password ? { password: form.password } : {}),
        };

        if (editTarget.kind === "user") {
          await usersApi.update(editTarget.record.userId, payload);
          if (!contactReadOnly) {
            await syncSuperAdminContactProfile(form.email, form.phoneNumber);
          }
          push("User updated", "success");
        } else {
          await adminsApi.update(editTarget.record.adminId, {
            ...payload,
            email: form.email.trim(),
            phoneNumber: form.phoneNumber.trim(),
            departments: selectedDepartments,
            department: selectedDepartments[0] ?? form.department,
          });
          push("Administrator updated", "success");
        }
      } else if (isUser) {
        if (!assignedKey) return;
        const createdUser = await usersApi.register({
          username: form.username.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          middleInitial: form.middleInitial.trim(),
          lastName: form.lastName.trim(),
          department: form.department,
          company: form.company.trim(),
        });
        await keysApi.assign(assignedKey.serialId, createdUser.userId);
        await syncSuperAdminContactProfile(form.email, form.phoneNumber);
        push("User registered and license key assigned", "success");
      } else {
        const adminDepartments =
          departmentOptions.length === 0
            ? form.department.trim()
              ? [form.department.trim()]
              : []
            : selectedDepartments;

        await adminsApi.create({
          username: form.username.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          middleInitial: form.middleInitial.trim(),
          lastName: form.lastName.trim(),
          departments: adminDepartments,
          department: adminDepartments[0] ?? form.department.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          roleId: 2,
        });
        setRegisteredAdminUsername(form.username.trim());
        return;
      }

      await onRegistered();
      onClose();
    } catch (error) {
      setErrors((current) => ({
        ...current,
        username: extractApiError(
          error,
          "Registration failed. Check if the username or email is already used.",
        ),
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {!registeredAdminUsername ? (
        <div className="registration-edit-backdrop" role="presentation">
          <form className={`registration-edit-modal registration-edit-modal--${mode}`} onSubmit={submit}>
        <div className="registration-edit-modal__header">
          <div>
            <img src="/assets/Add-User.svg" alt="" aria-hidden="true" />
            <h2>{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={`Close ${title} form`} />
        </div>

        <div className="registration-edit-modal__body">
          {!isEditing && (
            <p className="registration-edit-notice">
              Default password reminder: {isUser ? "Users" : "Administrators"} are registered with{" "}
              <strong>{defaultPasswordForMode(mode)}</strong>. Share this with the account holder after
              registration.
            </p>
          )}

          <section className="registration-edit-section">
            <h3>
              <img src="/assets/Admin-User-Info.svg" alt="" aria-hidden="true" />
              Account Information
            </h3>
            <label className="registration-edit-field registration-edit-field--wide">
              <span>Username</span>
              <input
                value={form.username}
                onChange={(event) => updateField("username", event.target.value)}
                autoComplete="username"
              />
              {errors.username && <strong>{errors.username}</strong>}
            </label>

            <div className={isUser ? "registration-edit-grid registration-edit-grid--password" : "registration-edit-grid registration-edit-grid--admin-password"}>
              <label className="registration-edit-field">
                <span>Default Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  autoComplete="new-password"
                />
                <p className="registration-edit-password-help">
                  {isEditing
                    ? "Leave blank to keep the current password. Minimum 7 characters if changing."
                    : `Default password is ${defaultPasswordForMode(mode)} (pre-filled). You may change it before registering.`}
                </p>
                {errors.password && <strong>{errors.password}</strong>}
              </label>
            </div>
          </section>

          <section className="registration-edit-section">
            <h3>
              <img src="/assets/Account-Info.svg" alt="" aria-hidden="true" />
              Personal Information
            </h3>
            <div className="registration-edit-name-grid">
              <label className="registration-edit-field">
                <span>First Name</span>
                <input
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  autoComplete="given-name"
                />
                {errors.firstName && <strong>{errors.firstName}</strong>}
              </label>
              <label className="registration-edit-field">
                <span>M.I.</span>
                <input
                  value={form.middleInitial}
                  maxLength={1}
                  onChange={(event) => updateField("middleInitial", event.target.value)}
                  autoComplete="additional-name"
                />
                {errors.middleInitial && <strong>{errors.middleInitial}</strong>}
              </label>
              <label className="registration-edit-field">
                <span>Last Name</span>
                <input
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  autoComplete="family-name"
                />
                {errors.lastName && <strong>{errors.lastName}</strong>}
              </label>
            </div>
            <div className="registration-edit-grid">
              {departmentOptions.length === 0 ? (
                <label className="registration-edit-field">
                  <span>{isUser ? "Assigned Department" : "Department"}</span>
                  <input
                    value={form.department}
                    onChange={(event) => updateField("department", event.target.value)}
                  />
                  {errors.department && <strong>{errors.department}</strong>}
                </label>
              ) : isUser ? (
                <div className="registration-edit-field registration-edit-field--select">
                  <span>{isUser ? "Assigned Department" : "Department"}</span>
                  <button
                    className="registration-edit-select-button"
                    type="button"
                    onClick={() => setDepartmentOpen((current) => !current)}
                  >
                    {form.department || "Select department"}
                  </button>
                  {departmentOpen && (
                    <div className="registration-edit-select-menu">
                      {departmentOptions.map((department) => (
                        <button type="button" key={department} onClick={() => selectDepartment(department)}>
                          {department}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.department && <strong>{errors.department}</strong>}
                </div>
              ) : (
                <div className="registration-edit-field registration-edit-field--select">
                  <span>Assigned Departments</span>
                  <button
                    className="registration-edit-select-button"
                    type="button"
                    onClick={() => setDepartmentOpen((current) => !current)}
                  >
                    {selectedDepartments.length > 0
                      ? selectedDepartments.join(", ")
                      : "Select departments"}
                  </button>
                  {departmentOpen && (
                    <div className="registration-edit-select-menu registration-edit-select-menu--multi">
                      {departmentOptions.map((department) => {
                        const checked = selectedDepartments.includes(department);
                        return (
                          <button
                            type="button"
                            key={department}
                            className={checked ? "is-selected" : undefined}
                            onClick={() => toggleAdminDepartment(department)}
                          >
                            <span aria-hidden="true">{checked ? "✓" : ""}</span>
                            {department}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.department && <strong>{errors.department}</strong>}
                </div>
              )}
              {companyOptions.length === 0 ? (
                <label className="registration-edit-field">
                  <span>{isUser ? "Company" : "Assigned Company"}</span>
                  <input
                    value={form.company}
                    onChange={(event) => updateField("company", event.target.value)}
                    autoComplete="organization"
                  />
                  {errors.company && <strong>{errors.company}</strong>}
                </label>
              ) : (
                <div className="registration-edit-field registration-edit-field--select">
                  <span>{isUser ? "Company" : "Assigned Company"}</span>
                  <button
                    className="registration-edit-select-button"
                    type="button"
                    onClick={() => setCompanyOpen((current) => !current)}
                  >
                    {form.company || "Select company"}
                  </button>
                  {companyOpen && (
                    <div className="registration-edit-select-menu">
                      {companyOptions.map((company) => (
                        <button type="button" key={company} onClick={() => selectCompany(company)}>
                          {company}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.company && <strong>{errors.company}</strong>}
                </div>
              )}
            </div>
          </section>

          <section className="registration-edit-section">
            <h3>
              <img src="/assets/Admin-User-Contact-Info.svg" alt="" aria-hidden="true" />
              {contactTitle}
            </h3>
            {isUser ? (
              <p className="registration-edit-section-note">
                These are administrator contact details shown to registered users for support. Users
                add their own contact information separately in Account Settings.
              </p>
            ) : null}
            <div className="registration-edit-grid">
              <label className="registration-edit-field">
                <span>{isUser ? "Admin Email" : "Email Address"}</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  autoComplete="email"
                  readOnly={contactReadOnly}
                  placeholder={
                    isUser ? "Enter your admin email for user support" : "Enter email address"
                  }
                />
                {errors.email && <strong>{errors.email}</strong>}
              </label>
              <label className="registration-edit-field">
                <span>{isUser ? "Admin Phone" : "Phone Number"}</span>
                <input
                  value={form.phoneNumber}
                  onChange={(event) => updateField("phoneNumber", event.target.value)}
                  autoComplete="tel"
                  inputMode="numeric"
                  readOnly={contactReadOnly}
                  placeholder={
                    isUser ? "Enter your admin phone for user support" : "+63"
                  }
                />
                {errors.phoneNumber && <strong>{errors.phoneNumber}</strong>}
              </label>
            </div>
          </section>

          {isUser && !isEditing && (
            <section className="registration-edit-section">
              <h3>
                <img src="/assets/License-Icon.svg" alt="" aria-hidden="true" />
                License Assignment
              </h3>
              <div className="registration-edit-license-row">
                <label className="registration-edit-field">
                  <span>Assigned Key</span>
                  <input readOnly value={assignedKey?.serialKey ?? ""} placeholder="No key assigned" />
                  {errors.assignedKey && <strong>{errors.assignedKey}</strong>}
                </label>
                <button type="button" onClick={autoAssignKey}>
                  Assign Key
                </button>
              </div>
            </section>
          )}
        </div>

        <div className="registration-edit-modal__footer">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Registering..." : submitText}
          </button>
        </div>
      </form>
        </div>
      ) : null}

      {registeredAdminUsername ? (
        <AdminRegisteredSuccessModal
          username={registeredAdminUsername}
          onDone={() => {
            setRegisteredAdminUsername(null);
            void onRegistered();
            onClose();
          }}
        />
      ) : null}
    </>
  );
}
