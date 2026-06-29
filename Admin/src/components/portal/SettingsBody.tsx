import type { FormEvent, ReactNode } from "react";
import {
  DEMO_ADMIN_SETTINGS,
  DEMO_ASSIGNED_TASKS,
  displayTaskStatus,
  taskStatusClass,
} from "../../data/demoSettings";
import { ADMINISTRATOR_OFFICER_ROLE } from "../../data/demoSettingsProfile";
import { useSettingsProfileStore } from "../../store/settingsProfileStore";
import "../../styles/portal-pages.css";
import "../../styles/settings-screen.css";

type Props = {
  variant?: "figma" | "portal";
  onSaveSettings?: () => void;
  passwordForm?: ReactNode;
};

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6.25" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3.75 15.25C4.55 12.65 6.55 11 9 11C11.45 11 13.45 12.65 14.25 15.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="4.25" y="8" width="9.5" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.25 8V6.25C6.25 4.45 7.7 3 9.5 3C11.3 3 12.75 4.45 12.75 6.25V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.1V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5.15" r="0.75" fill="currentColor" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 2.75H10.1L13 5.65V13.25C13 13.66 12.66 14 12.25 14H3.75C3.34 14 3 13.66 3 13.25V3.5C3 3.09 3.34 2.75 3.75 2.75Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M5.5 14V9.25H10.5V14" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 2.75V5.5H9.75" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 1.25L9.75 2.75V6C9.75 8.15 8.05 10.05 6 10.75C3.95 10.05 2.25 8.15 2.25 6V2.75L6 1.25Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M7.45 2.2L9.8 4.55L4.35 10H2V7.65L7.45 2.2Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="2.5" width="7" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.15" />
      <path d="M5.25 2.5V2C5.25 1.45 5.7 1 6.25 1H7.75C8.3 1 8.75 1.45 8.75 2V2.5" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  );
}

function IconRegional() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.15" />
      <path d="M2.5 7H11.5M7 2.5C5.6 4.35 5 5.65 5 7C5 8.35 5.6 9.65 7 11.5C8.4 9.65 9 8.35 9 7C9 5.65 8.4 4.35 7 2.5Z" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.15" />
      <path d="M7 4.75V7L8.6 8.1" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function renderStaticPasswordFields() {
  return (
    <>
      <div className="settings-screen__field settings-screen__field--full">
        <label className="settings-screen__label" htmlFor="settings-current-password">
          Current Password
        </label>
        <input
          id="settings-current-password"
          className="settings-screen__input"
          type="password"
          defaultValue="password1234"
          readOnly
        />
      </div>
      <div className="settings-screen__field">
        <label className="settings-screen__label" htmlFor="settings-new-password">
          New Password
        </label>
        <input
          id="settings-new-password"
          className="settings-screen__input"
          type="password"
          placeholder="New password"
        />
      </div>
      <div className="settings-screen__field">
        <label className="settings-screen__label" htmlFor="settings-confirm-password">
          Confirm New Password
        </label>
        <input
          id="settings-confirm-password"
          className="settings-screen__input"
          type="password"
          placeholder="Repeat new password"
        />
      </div>
    </>
  );
}

export default function SettingsBody({
  variant = "figma",
  onSaveSettings,
  passwordForm,
}: Props) {
  const formValues = useSettingsProfileStore((state) => state.formValues);
  const [firstName = "", ...lastParts] = formValues.fullName.trim().split(/\s+/);
  const settings =
    variant === "portal"
      ? {
          ...DEMO_ADMIN_SETTINGS,
          firstName,
          lastName: lastParts.join(" "),
          email: formValues.email,
          phone: formValues.phone,
          username: formValues.username,
          position: ADMINISTRATOR_OFFICER_ROLE,
        }
      : DEMO_ADMIN_SETTINGS;
  const saveButtonType = passwordForm ? "submit" : "button";
  const saveButtonForm = passwordForm ? "settings-password-form" : undefined;

  return (
    <div className="admin-shell__content settings-screen">
      <div className="settings-screen__toolbar">
        <button
          type={saveButtonType}
          form={saveButtonForm}
          className="settings-screen__save-btn"
          onClick={saveButtonType === "button" ? onSaveSettings : undefined}
        >
          <IconSave />
          Save Settings
        </button>
      </div>

      <div className="settings-screen__layout">
        <div className="settings-screen__main">
          <section className="settings-screen__card">
            <h2 className="settings-screen__card-title">
              <IconUser />
              Personal Information
            </h2>
            <div className="settings-screen__fields">
              <div className="settings-screen__field">
                <label className="settings-screen__label" htmlFor="settings-first-name">
                  First Name
                </label>
                <input
                  id="settings-first-name"
                  className="settings-screen__input"
                  key={`first-${formValues.username}`}
                  defaultValue={settings.firstName}
                  readOnly={variant === "portal"}
                />
              </div>
              <div className="settings-screen__field">
                <label className="settings-screen__label" htmlFor="settings-last-name">
                  Last Name
                </label>
                <input
                  id="settings-last-name"
                  className="settings-screen__input"
                  defaultValue={settings.lastName}
                  readOnly={variant === "portal"}
                />
              </div>
              <div className="settings-screen__field settings-screen__field--full">
                <label className="settings-screen__label" htmlFor="settings-email">
                  Email Address
                </label>
                <input
                  id="settings-email"
                  className="settings-screen__input"
                  defaultValue={settings.email}
                  readOnly={variant === "portal"}
                />
              </div>
              <div className="settings-screen__field">
                <label className="settings-screen__label" htmlFor="settings-phone">
                  Phone Number
                </label>
                <input
                  id="settings-phone"
                  className="settings-screen__input"
                  defaultValue={settings.phone}
                  readOnly={variant === "portal"}
                />
              </div>
              <div className="settings-screen__field">
                <label className="settings-screen__label" htmlFor="settings-position">
                  Position
                </label>
                <input
                  id="settings-position"
                  className="settings-screen__input"
                  defaultValue={settings.position}
                  readOnly={variant === "portal"}
                />
              </div>
            </div>
          </section>

          <section className="settings-screen__card">
            <h2 className="settings-screen__card-title">
              <IconLock />
              Security &amp; Password
            </h2>
            <div className="settings-screen__fields">
              {passwordForm ?? renderStaticPasswordFields()}
            </div>
            <div className="settings-screen__password-note">
              <IconInfo />
              <span>
                Passwords must be at least 12 characters long and include a combination of letters, numbers, and
                symbols.
              </span>
            </div>
          </section>
        </div>

        <aside className="settings-screen__aside">
          <section className="settings-screen__card settings-screen__profile-card">
            <div className="settings-screen__avatar-wrap">
              <img className="settings-screen__avatar" src={settings.avatarUrl ?? ""} alt="" />
              <button type="button" className="settings-screen__avatar-edit" aria-label="Edit profile photo">
                <IconEdit />
              </button>
            </div>
            <h3 className="settings-screen__username">{settings.username}</h3>
            <span className="settings-screen__role-badge">
              <IconShield />
              {settings.role}
            </span>
            <div className="settings-screen__meta-list">
              <div className="settings-screen__meta-row">
                <span className="settings-screen__meta-label">Admin ID</span>
                <span className="settings-screen__meta-value">{settings.adminId}</span>
              </div>
              <div className="settings-screen__meta-row">
                <span className="settings-screen__meta-label">Last Login</span>
                <span className="settings-screen__meta-value">{settings.lastLogin}</span>
              </div>
              <div className="settings-screen__meta-row">
                <span className="settings-screen__meta-label">Security Status</span>
                <span className="settings-screen__secure-pill">{settings.securityStatus}</span>
              </div>
            </div>
          </section>

          <section className="settings-screen__card">
            <h3 className="settings-screen__section-label">
              <IconClipboard />
              Assigned Tasks
            </h3>
            <div className="settings-screen__tasks">
              {DEMO_ASSIGNED_TASKS.map((task) => (
                <div key={task.id} className="settings-screen__task-row">
                  <span>{task.label}</span>
                  <span className={`settings-screen__task-badge settings-screen__task-badge--${taskStatusClass(task.status)}`}>
                    {displayTaskStatus(task.status)}
                  </span>
                </div>
              ))}
            </div>
            <button type="button" className="settings-screen__view-tasks">
              View All Tasks &gt;
            </button>
          </section>

          <section className="settings-screen__card">
            <h3 className="settings-screen__section-label">
              <IconRegional />
              Regional Settings
            </h3>
            <div className="settings-screen__fields">
              <div className="settings-screen__field settings-screen__field--full">
                <label className="settings-screen__label" htmlFor="settings-language">
                  Language Preference
                </label>
                <div className="settings-screen__select-wrap">
                  <select id="settings-language" className="settings-screen__select" defaultValue={settings.language}>
                    <option value="English (United States)">English (United States)</option>
                    <option value="English (United Kingdom)">English (United Kingdom)</option>
                    <option value="Spanish (Latin America)">Spanish (Latin America)</option>
                  </select>
                  <span className="settings-screen__select-chevron" aria-hidden="true">
                    <IconChevronDown />
                  </span>
                </div>
              </div>
              <div className="settings-screen__field settings-screen__field--full">
                <label className="settings-screen__label" htmlFor="settings-timezone">
                  Timezone
                </label>
                <div className="settings-screen__select-wrap settings-screen__select-wrap--timezone">
                  <select id="settings-timezone" className="settings-screen__select" defaultValue={settings.timezone}>
                    <option value="(GMT-05:00) Eastern Time">(GMT-05:00) Eastern Time</option>
                    <option value="(GMT-06:00) Central Time">(GMT-06:00) Central Time</option>
                    <option value="(GMT+00:00) Greenwich Mean Time">(GMT+00:00) Greenwich Mean Time</option>
                  </select>
                  <span className="settings-screen__select-icon" aria-hidden="true">
                    <IconClock />
                  </span>
                  <span className="settings-screen__select-chevron" aria-hidden="true">
                    <IconChevronDown />
                  </span>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export function PasswordChangeForm({
  onSubmit,
  register,
  errors,
  isSubmitting: _isSubmitting,
}: {
  onSubmit: (e: FormEvent) => void;
  register: (name: string) => object;
  errors: Record<string, { message?: string } | undefined>;
  isSubmitting?: boolean;
}) {
  return (
    <form id="settings-password-form" className="settings-screen__password-form" onSubmit={onSubmit}>
      <div className="settings-screen__field settings-screen__field--full">
        <label className="settings-screen__label" htmlFor="settings-current-password">
          Current Password
        </label>
        <input
          id="settings-current-password"
          type="password"
          className="settings-screen__input"
          {...register("currentPassword")}
        />
        {errors.currentPassword && <span className="text-error">{errors.currentPassword.message}</span>}
      </div>
      <div className="settings-screen__field">
        <label className="settings-screen__label" htmlFor="settings-new-password">
          New Password
        </label>
        <input
          id="settings-new-password"
          type="password"
          className="settings-screen__input"
          placeholder="New password"
          {...register("newPassword")}
        />
        {errors.newPassword && <span className="text-error">{errors.newPassword.message}</span>}
      </div>
      <div className="settings-screen__field">
        <label className="settings-screen__label" htmlFor="settings-confirm-password">
          Confirm New Password
        </label>
        <input
          id="settings-confirm-password"
          type="password"
          className="settings-screen__input"
          placeholder="Repeat new password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <span className="text-error">{errors.confirmPassword.message}</span>}
      </div>
    </form>
  );
}
