import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  ADMINISTRATOR_OFFICER_ROLE,
  DEFAULT_ADMIN_PASSWORD,
  DEMO_SETTINGS_PROFILE,
  getPasswordRequirementCheck,
  isNewPasswordValid,
  SETTINGS_NAV_ITEMS,
  type SettingsFormValues,
  type SettingsNavId,
} from "../../data/demoSettingsProfile";
import { useSettingsProfileStore } from "../../store/settingsProfileStore";
import SettingsNotificationPreferences from "./SettingsNotificationPreferences";
import SettingsActivityHistory from "./SettingsActivityHistory";
import PortalOverlay from "./PortalOverlay";
import ProfilePhotoPreviewModal from "./ProfilePhotoPreviewModal";
import ProfilePhotoCropModal from "./ProfilePhotoCropModal";
import ProfileChangesSavedModal from "./ProfileChangesSavedModal";
import "../../styles/settings-figma-screen.css";
import "../../styles/settings-profile-photo-preview.css";

type ActionButtonId = "sign-out" | "reset" | "cancel" | "save";

type ActionNotice = {
  text: string;
  tone: "success" | "neutral" | "danger";
};

const ACTION_CLICK_FLASH_MS = 450;
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

function resolveStoredAvatarUrl(storedAvatarUrl: string | null | undefined): string | null {
  return storedAvatarUrl === undefined ? DEMO_SETTINGS_PROFILE.avatarUrl : storedAvatarUrl;
}

function getProfileInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type Props = {
  onSaveSettings?: () => void;
  onSaveProfile?: (values: SettingsFormValues) => void | Promise<void>;
};

function IconShieldCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5L11.375 3.25V6.75C11.375 8.95 9.625 10.775 7 11.5C4.375 10.775 2.625 8.95 2.625 6.75V3.25L7 1.5Z"
        fill="#00a76a"
      />
      <path
        d="M4.75 6.75L6.25 8.25L9.25 5"
        stroke="#ffffff"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.75 4.75H4.2L5.1 3.25H8.9L9.8 4.75H11.25C11.94 4.75 12.5 5.31 12.5 6V10.25C12.5 10.94 11.94 11.5 11.25 11.5H2.75C2.06 11.5 1.5 10.94 1.5 10.25V6C1.5 5.31 2.06 4.75 2.75 4.75Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7.75" r="1.75" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  );
}

function IconEye({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M3.25 3.25L14.75 14.75M7.35 7.56C7.12 7.89 7 8.29 7 8.71C7 9.86 7.94 10.8 9.09 10.8C9.51 10.8 9.91 10.68 10.24 10.45M12.74 12.32C11.62 13.12 10.2 13.6 8.67 13.6C5.33 13.6 2.53 11.35 1.5 8.4C2.02 6.96 2.93 5.72 4.12 4.84"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M6.2 3.77C6.84 3.62 7.5 3.53 8.18 3.53C11.52 3.53 14.32 5.78 15.35 8.73C14.98 9.74 14.35 10.63 13.55 11.32"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M1.5 8.71C2.53 5.76 5.33 3.51 8.67 3.51C12.01 3.51 14.81 5.76 15.84 8.71C14.81 11.66 12.01 13.91 8.67 13.91C5.33 13.91 2.53 11.66 1.5 8.71Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8.67" cy="8.71" r="2.25" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  startVisible = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  startVisible?: boolean;
}) {
  const [visible, setVisible] = useState(startVisible);

  return (
    <div className="settings-figma__field">
      <label className="settings-figma__label" htmlFor={id}>
        {label}
      </label>
      <div className="settings-figma__password-wrap">
        <input
          id={id}
          className="settings-figma__input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="settings-figma__password-toggle"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setVisible((current) => !current)}
        >
          <IconEye hidden={!visible} />
        </button>
      </div>
    </div>
  );
}

export default function SettingsScreenBody({ onSaveSettings, onSaveProfile }: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const saveProfile = useSettingsProfileStore((state) => state.saveProfile);
  const storedFormValues = useSettingsProfileStore((state) => state.formValues);
  const storedAvatarUrl = useSettingsProfileStore((state) => state.avatarUrl);
  const passwordChanged = useSettingsProfileStore((state) => state.passwordChanged);
  const setAvatarUrl = useSettingsProfileStore((state) => state.setAvatarUrl);
  const initialValues = storedFormValues;
  const lastSavedRef = useRef<SettingsFormValues>(initialValues);
  const lastSavedAvatarRef = useRef<string | null>(resolveStoredAvatarUrl(storedAvatarUrl));
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(lastSavedAvatarRef.current);
  const [activeNav, setActiveNav] = useState<SettingsNavId>("profile");
  const [fullName, setFullName] = useState<string>(initialValues.fullName);
  const [email, setEmail] = useState<string>(initialValues.email);
  const [phone, setPhone] = useState<string>(initialValues.phone);
  const [username, setUsername] = useState<string>(initialValues.username);
  const [organization, setOrganization] = useState<string>(initialValues.organization);
  const [department, setDepartment] = useState<string>(initialValues.department);
  const [currentPassword, setCurrentPassword] = useState<string>(initialValues.currentPassword);
  const [newPassword, setNewPassword] = useState<string>(initialValues.newPassword);
  const [formRevision, setFormRevision] = useState(0);
  const [actionNotice, setActionNotice] = useState<ActionNotice | null>(null);
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);
  const [photoCropSource, setPhotoCropSource] = useState<string | null>(null);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [clickedButton, setClickedButton] = useState<ActionButtonId | null>(null);
  const clickFlashTimeoutRef = useRef<number | null>(null);
  const signOutTimeoutRef = useRef<number | null>(null);
  const saveSuccessTimeoutRef = useRef<number | null>(null);

  const ACCOUNT_SETTINGS_SUCCESS_MS = 3000;

  useEffect(() => {
    if (!saveSuccessOpen) return;

    if (saveSuccessTimeoutRef.current !== null) {
      window.clearTimeout(saveSuccessTimeoutRef.current);
    }

    saveSuccessTimeoutRef.current = window.setTimeout(() => {
      setSaveSuccessOpen(false);
      saveSuccessTimeoutRef.current = null;
    }, ACCOUNT_SETTINGS_SUCCESS_MS);

    return () => {
      if (saveSuccessTimeoutRef.current !== null) {
        window.clearTimeout(saveSuccessTimeoutRef.current);
        saveSuccessTimeoutRef.current = null;
      }
    };
  }, [saveSuccessOpen]);

  useEffect(() => {
    return () => {
      if (clickFlashTimeoutRef.current !== null) {
        window.clearTimeout(clickFlashTimeoutRef.current);
      }
      if (signOutTimeoutRef.current !== null) {
        window.clearTimeout(signOutTimeoutRef.current);
      }
    };
  }, []);

  const flashActionButton = (buttonId: ActionButtonId) => {
    setClickedButton(buttonId);

    if (clickFlashTimeoutRef.current !== null) {
      window.clearTimeout(clickFlashTimeoutRef.current);
    }

    clickFlashTimeoutRef.current = window.setTimeout(() => {
      setClickedButton(null);
      clickFlashTimeoutRef.current = null;
    }, ACTION_CLICK_FLASH_MS);
  };

  const showActionNotice = (notice: ActionNotice) => {
    setActionNotice(notice);
  };

  const applyFormValues = (values: SettingsFormValues) => {
    setFullName(values.fullName);
    setEmail(values.email);
    setPhone(values.phone);
    setUsername(values.username);
    setOrganization(values.organization);
    setDepartment(values.department);
    setCurrentPassword(values.currentPassword);
    setNewPassword(values.newPassword);
  };

  const getCurrentFormValues = (): SettingsFormValues => ({
    fullName,
    email,
    phone,
    username,
    organization,
    department,
    currentPassword,
    newPassword,
  });

  const restoreLastSavedChanges = () => {
    applyFormValues(lastSavedRef.current);
    setDraftAvatarUrl(lastSavedAvatarRef.current);
    setFormRevision((revision) => revision + 1);
  };

  const handleSave = async () => {
    flashActionButton("save");

    if (newPassword.trim()) {
      if (!currentPassword.trim()) {
        showActionNotice({ text: "Current password is required to set a new password.", tone: "danger" });
        return;
      }

      if (!isNewPasswordValid(newPassword)) {
        showActionNotice({
          text: "New password must contain at least 8 characters, 1 number, and 1 special character.",
          tone: "danger",
        });
        return;
      }
    }

    const currentValues = getCurrentFormValues();

    try {
      if (onSaveProfile) {
        await onSaveProfile(currentValues);
      }

      const nextSaved = saveProfile(currentValues);
      lastSavedRef.current = nextSaved;
      lastSavedAvatarRef.current = draftAvatarUrl;
      setAvatarUrl(draftAvatarUrl);
      applyFormValues(nextSaved);
      setFormRevision((revision) => revision + 1);
      setSaveSuccessOpen(true);
    } catch (error) {
      showActionNotice({
        text: error instanceof Error ? error.message : "Failed to save settings. Please try again.",
        tone: "danger",
      });
    }
  };

  const closeSaveSuccess = () => {
    setSaveSuccessOpen(false);
  };

  const handleCancel = () => {
    flashActionButton("cancel");
    restoreLastSavedChanges();
    showActionNotice({ text: "Unsaved changes were discarded.", tone: "neutral" });
  };

  const handleReset = () => {
    flashActionButton("reset");
    restoreLastSavedChanges();
    showActionNotice({ text: "Form reset to your last saved values.", tone: "neutral" });
  };

  const handleSignOut = () => {
    flashActionButton("sign-out");
    showActionNotice({ text: "Signing out...", tone: "danger" });

    if (signOutTimeoutRef.current !== null) {
      window.clearTimeout(signOutTimeoutRef.current);
    }

    signOutTimeoutRef.current = window.setTimeout(() => {
      void logout();
      signOutTimeoutRef.current = null;
    }, ACTION_CLICK_FLASH_MS);
  };

  const openPhotoPreview = () => {
    if (!draftAvatarUrl) {
      return;
    }

    setPhotoPreviewOpen(true);
  };

  const closePhotoPreview = () => {
    setPhotoPreviewOpen(false);
  };

  const openPhotoPicker = () => {
    photoInputRef.current?.click();
  };

  const closePhotoCrop = () => {
    setPhotoCropSource(null);
  };

  const handlePhotoCropped = (croppedImageUrl: string) => {
    setDraftAvatarUrl(croppedImageUrl);
    showActionNotice({ text: "Profile photo updated.", tone: "success" });
  };

  const handlePhotoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showActionNotice({ text: "Please choose an image file.", tone: "danger" });
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      showActionNotice({ text: "Image must be 5 MB or smaller.", tone: "danger" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        showActionNotice({ text: "Could not read the selected image.", tone: "danger" });
        return;
      }

      setPhotoCropSource(reader.result);
    };
    reader.onerror = () => {
      showActionNotice({ text: "Could not read the selected image.", tone: "danger" });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (!draftAvatarUrl) {
      return;
    }

    setDraftAvatarUrl(null);
    showActionNotice({ text: "Profile photo removed.", tone: "neutral" });
  };

  const identityName = fullName;
  const passwordRequirements = useMemo(
    () => getPasswordRequirementCheck(newPassword),
    [newPassword]
  );
  const showPasswordRequirementState = newPassword.length > 0;

  return (
    <div className="admin-shell__content settings-figma">
      <div className="settings-figma__shell">
        <nav className="settings-figma__nav" aria-label="Settings sections">
          {SETTINGS_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`settings-figma__nav-item${
                activeNav === item.id ? " settings-figma__nav-item--active" : ""
              }`}
              onClick={() => {
                setActiveNav(item.id);
                setActionNotice(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="settings-figma__panel">
          {activeNav === "profile" ? (
            <>
              <header className="settings-figma__panel-head">
                <h1 className="settings-figma__panel-title">Profile Settings</h1>
                <p className="settings-figma__panel-subtitle">
                  Update your public information and organizational details below.
                </p>
                {actionNotice ? (
                  <p
                    className={`settings-figma__action-notice settings-figma__action-notice--${actionNotice.tone}`}
                    role="status"
                  >
                    {actionNotice.text}
                  </p>
                ) : null}
              </header>

              <div className="settings-figma__identity-card">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="settings-figma__photo-input"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={handlePhotoSelected}
                />

                <div className="settings-figma__avatar-wrap">
                  {draftAvatarUrl ? (
                    <button
                      type="button"
                      className="settings-figma__avatar-button"
                      onClick={openPhotoPreview}
                      aria-label={`View profile photo for ${identityName}`}
                    >
                      <img className="settings-figma__avatar" src={draftAvatarUrl} alt="" />
                    </button>
                  ) : (
                    <div className="settings-figma__avatar settings-figma__avatar--placeholder" aria-hidden="true">
                      {getProfileInitials(identityName)}
                    </div>
                  )}
                  <button
                    type="button"
                    className="settings-figma__avatar-camera"
                    aria-label="Upload profile photo"
                    onClick={openPhotoPicker}
                  >
                    <IconCamera />
                  </button>
                </div>

                <div className="settings-figma__identity-copy">
                  <h2 className="settings-figma__identity-name">{identityName}</h2>
                  <p className="settings-figma__identity-role">
                    <IconShieldCheck />
                    <span>{ADMINISTRATOR_OFFICER_ROLE}</span>
                  </p>
                  <div className="settings-figma__identity-actions">
                    <button type="button" className="settings-figma__upload-link" onClick={openPhotoPicker}>
                      Upload New Photo
                    </button>
                    <span className="settings-figma__identity-actions-sep" aria-hidden="true">
                      ·
                    </span>
                    <button
                      type="button"
                      className="settings-figma__remove-link"
                      onClick={handleRemovePhoto}
                      disabled={!draftAvatarUrl}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <section className="settings-figma__section">
                <h3 className="settings-figma__section-title">Profile</h3>
                <div className="settings-figma__fields settings-figma__fields--profile">
                  <div className="settings-figma__field">
                    <label className="settings-figma__label" htmlFor="settings-fullname">
                      Fullname
                    </label>
                    <input
                      id="settings-fullname"
                      className="settings-figma__input"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </div>
                  <div className="settings-figma__field">
                    <label className="settings-figma__label" htmlFor="settings-profile-username">
                      Username
                    </label>
                    <input
                      id="settings-profile-username"
                      className="settings-figma__input"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                    />
                  </div>
                  <div className="settings-figma__field settings-figma__field--full">
                    <label className="settings-figma__label" htmlFor="settings-email">
                      Email Address
                    </label>
                    <input
                      id="settings-email"
                      className="settings-figma__input"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <div className="settings-figma__field settings-figma__field--full">
                    <label className="settings-figma__label" htmlFor="settings-phone">
                      Phone Number
                    </label>
                    <input
                      id="settings-phone"
                      className="settings-figma__input"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </div>
                </div>
              </section>

              <div className="settings-figma__split">
                <section className="settings-figma__section settings-figma__section--account">
                  <h3 className="settings-figma__section-title">Account Information</h3>
                  <div className="settings-figma__fields settings-figma__fields--account">
                    <div className="settings-figma__field">
                      <label className="settings-figma__label" htmlFor="settings-account-username">
                        Username
                      </label>
                      <input
                        id="settings-account-username"
                        className="settings-figma__input settings-figma__input--account-readonly"
                        value={username}
                        readOnly
                        aria-readonly="true"
                        tabIndex={-1}
                      />
                    </div>
                    <div className="settings-figma__assignment">
                      <span className="settings-figma__assignment-heading">Assignment</span>
                      <div className="settings-figma__assignment-rows">
                        <div className="settings-figma__assignment-row">
                          <label className="settings-figma__assignment-label" htmlFor="settings-organization">
                            Organization
                          </label>
                          <input
                            id="settings-organization"
                            className="settings-figma__input settings-figma__input--account-readonly"
                            value={organization}
                            readOnly
                            aria-readonly="true"
                            tabIndex={-1}
                          />
                        </div>
                        <div className="settings-figma__assignment-row settings-figma__assignment-row--department">
                          <label className="settings-figma__assignment-label" htmlFor="settings-department">
                            Department
                          </label>
                          <input
                            id="settings-department"
                            className="settings-figma__input settings-figma__input--account-readonly"
                            value={department}
                            readOnly
                            aria-readonly="true"
                            tabIndex={-1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="settings-figma__section-actions settings-figma__section-actions--left">
                    <button
                      type="button"
                      className={`settings-figma__sign-out-btn${
                        clickedButton === "sign-out" ? " settings-figma__sign-out-btn--clicked" : ""
                      }`}
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                    <button
                      type="button"
                      className={`settings-figma__reset-btn${
                        clickedButton === "reset" ? " settings-figma__reset-btn--clicked" : ""
                      }`}
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>
                </section>

                <section className="settings-figma__section settings-figma__section--pin">
                  <h3 className="settings-figma__section-title">Change Password</h3>
                  <div className="settings-figma__fields settings-figma__fields--pin" key={formRevision}>
                    <PasswordField
                      id="settings-current-password"
                      label="Current Password"
                      value={passwordChanged ? currentPassword : currentPassword || DEFAULT_ADMIN_PASSWORD}
                      onChange={setCurrentPassword}
                      startVisible={!passwordChanged}
                    />
                    <PasswordField
                      id="settings-new-password"
                      label="New Password"
                      value={newPassword}
                      onChange={setNewPassword}
                    />
                  </div>
                  <div className="settings-figma__password-requirements">
                    <p className="settings-figma__password-requirements-title">Password must contain:</p>
                    <ul className="settings-figma__password-requirements-list">
                      <li
                        className={
                          showPasswordRequirementState
                            ? passwordRequirements.hasMinLength
                              ? "settings-figma__password-requirements-item--met"
                              : "settings-figma__password-requirements-item--unmet"
                            : undefined
                        }
                      >
                        *At least 8 characters
                      </li>
                      <li
                        className={
                          showPasswordRequirementState
                            ? passwordRequirements.hasNumber
                              ? "settings-figma__password-requirements-item--met"
                              : "settings-figma__password-requirements-item--unmet"
                            : undefined
                        }
                      >
                        *At least 1 number
                      </li>
                      <li
                        className={
                          showPasswordRequirementState
                            ? passwordRequirements.hasSpecialCharacter
                              ? "settings-figma__password-requirements-item--met"
                              : "settings-figma__password-requirements-item--unmet"
                            : undefined
                        }
                      >
                        *At least 1 special character
                      </li>
                    </ul>
                  </div>
                  <div className="settings-figma__section-actions settings-figma__section-actions--right">
                    <button
                      type="button"
                      className={`settings-figma__cancel-btn${
                        clickedButton === "cancel" ? " settings-figma__cancel-btn--clicked" : ""
                      }`}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`settings-figma__save-btn${
                        clickedButton === "save" ? " settings-figma__save-btn--clicked" : ""
                      }`}
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                  </div>
                </section>
              </div>
            </>
          ) : activeNav === "notifications" ? (
            <SettingsNotificationPreferences onSave={onSaveSettings} />
          ) : activeNav === "activity" ? (
            <SettingsActivityHistory />
          ) : null}
        </div>
      </div>

      <footer className="settings-figma__footer">
        <span>© 2024 LicenseManager Pro. All rights reserved.</span>
        <div className="settings-figma__footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </footer>

      <PortalOverlay open={saveSuccessOpen} onClose={closeSaveSuccess}>
        <ProfileChangesSavedModal onClose={closeSaveSuccess} />
      </PortalOverlay>

      <PortalOverlay open={Boolean(photoCropSource)} onClose={closePhotoCrop}>
        {photoCropSource ? (
          <ProfilePhotoCropModal
            imageSrc={photoCropSource}
            onClose={closePhotoCrop}
            onApply={handlePhotoCropped}
            onError={() => showActionNotice({ text: "Could not crop the selected image.", tone: "danger" })}
          />
        ) : null}
      </PortalOverlay>

      <PortalOverlay open={photoPreviewOpen && Boolean(draftAvatarUrl)} onClose={closePhotoPreview}>
        {draftAvatarUrl ? (
          <ProfilePhotoPreviewModal photoUrl={draftAvatarUrl} name={identityName} onClose={closePhotoPreview} />
        ) : null}
      </PortalOverlay>
    </div>
  );
}
