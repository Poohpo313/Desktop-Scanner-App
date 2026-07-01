import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfilePhotoIdentityCard } from "../profile/ProfilePhotoIdentityCard";
import { useProfilePhoto } from "../../hooks/useProfilePhoto";
import { useSession } from "../../context/SessionContext";
import "../../styles/settings-figma-screen.css";
import "../../styles/user-account-settings.css";
import "../../styles/scan-offline.css";
import { AccountSettingsSavedToast } from "./AccountSettingsSavedToast";
import {
  loadUserKnownPassword,
  markUserPasswordChanged,
  saveUserKnownPassword,
} from "../../lib/userKnownPassword";
import {
  getPasswordRequirementCheck,
  isNewPasswordValid,
  PASSWORD_REQUIREMENT_SUMMARY,
} from "../../lib/passwordRules";

const ACCOUNT_SETTINGS_SUCCESS_MS = 3000;

function displayValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "-";
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
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export function UserAccountSettingsPageView() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("-");
  const [department, setDepartment] = useState("-");
  const [adminContactName, setAdminContactName] = useState("-");
  const [adminContactEmail, setAdminContactEmail] = useState("-");
  const [adminContactPhone, setAdminContactPhone] = useState("-");
  const [currentPassword, setCurrentPassword] = useState(() => loadUserKnownPassword(session.userId));
  const [newPassword, setNewPassword] = useState("");
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { photoUrl, setPhoto } = useProfilePhoto(session.userId);
  const passwordRequirements = useMemo(
    () => getPasswordRequirementCheck(newPassword),
    [newPassword],
  );
  const showPasswordRequirementState = newPassword.length > 0;

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = window.setTimeout(() => {
      setSaveSuccess(false);
      navigate(-1);
    }, ACCOUNT_SETTINGS_SUCCESS_MS);
    return () => window.clearTimeout(timer);
  }, [saveSuccess, navigate]);

  useEffect(() => {
    if (session.userId == null) return;

    void (async () => {
      let known = loadUserKnownPassword(session.userId);
      if (window.bukolabs?.auth?.getKnownPassword) {
        const result = await window.bukolabs.auth.getKnownPassword({ userId: session.userId! });
        if (result.success && result.password?.trim()) {
          known = result.password.trim();
          saveUserKnownPassword(known, session.userId);
        }
      }
      setCurrentPassword(known);
    })();
  }, [session.userId]);

  useEffect(() => {
    void (async () => {
      if (!session.token || !window.bukolabs?.auth) {
        setLoading(false);
        return;
      }

      const result = await window.bukolabs.auth.getProfile({ token: session.token });
      if (result.success && result.profile) {
        const profile = result.profile;
        const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
        setFullName(name || profile.username);
        setUsername(profile.username);
        setEmail(profile.email ?? "");
        setPhone(profile.phoneNumber ?? "");
        setOrganization(displayValue(profile.company));
        setDepartment(displayValue(profile.department));
        setAdminContactName(displayValue(profile.adminContact?.adminName));
        setAdminContactEmail(displayValue(profile.adminContact?.email));
        setAdminContactPhone(displayValue(profile.adminContact?.phoneNumber));
        if (session.userId != null && window.bukolabs?.auth?.getKnownPassword) {
          const knownResult = await window.bukolabs.auth.getKnownPassword({ userId: session.userId });
          if (knownResult.success && knownResult.password?.trim()) {
            const known = knownResult.password.trim();
            saveUserKnownPassword(known, session.userId);
            setCurrentPassword(known);
          } else {
            setCurrentPassword(loadUserKnownPassword(session.userId));
          }
        } else {
          setCurrentPassword(loadUserKnownPassword(session.userId));
        }
      }
      setLoading(false);
    })();
  }, [session.token, session.userId]);

  async function handleSave() {
    if (!session.token || !window.bukolabs?.auth) return;

    setSaving(true);
    setError(null);

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    const profileResult = await window.bukolabs.auth.updateProfile({
      token: session.token,
      firstName,
      lastName,
      email: email.trim(),
      phoneNumber: phone.trim(),
    });

    if (!profileResult.success) {
      setSaving(false);
      setError(profileResult.error ?? "Could not save profile");
      return;
    }

    if (newPassword.trim()) {
      if (!currentPassword.trim()) {
        setSaving(false);
        setError("Current password is required to set a new password.");
        return;
      }

      if (!isNewPasswordValid(newPassword.trim())) {
        setSaving(false);
        setError(PASSWORD_REQUIREMENT_SUMMARY);
        return;
      }

      let currentForChange = currentPassword.trim();
      if (session.userId != null && window.bukolabs?.auth?.getKnownPassword) {
        const knownResult = await window.bukolabs.auth.getKnownPassword({ userId: session.userId });
        if (knownResult.success && knownResult.password?.trim()) {
          currentForChange = knownResult.password.trim();
        }
      }

      const passwordResult = await window.bukolabs.auth.changePassword({
        token: session.token,
        currentPassword: currentForChange,
        newPassword: newPassword.trim(),
      });

      if (!passwordResult.success) {
        setSaving(false);
        setError(passwordResult.error ?? "Could not change password");
        return;
      }

      markUserPasswordChanged(session.userId);
      saveUserKnownPassword(newPassword.trim(), session.userId);
      setCurrentPassword(newPassword.trim());
      setNewPassword("");
    }

    setSaving(false);
    setSaveSuccess(true);
  }

  return (
    <div className="user-account-settings-backdrop" role="presentation">
      {saveSuccess ? (
        <div className="user-account-settings-success-wrap">
          <AccountSettingsSavedToast onClose={() => {
            setSaveSuccess(false);
            navigate(-1);
          }} />
        </div>
      ) : null}
      <section
        className="user-account-settings-window settings-figma"
        role="dialog"
        aria-modal="true"
        aria-label="Account Settings"
      >
        <header className="user-account-settings-window__header">
          <div>
            <h1 className="settings-figma__panel-title">Account Settings</h1>
            <p className="settings-figma__panel-subtitle">
              Manage your profile and account credentials.
            </p>
          </div>
          <button type="button" className="user-account-settings-window__close" onClick={() => navigate(-1)}>
            Close
          </button>
        </header>

        {loading ? (
          <p className="user-account-settings-window__loading">Loading account...</p>
        ) : (
          <div className="user-account-settings-window__body">
            {error ? <p className="user-account-settings-window__error">{error}</p> : null}
            {photoNotice ? <p className="user-account-settings-window__notice">{photoNotice}</p> : null}

            <ProfilePhotoIdentityCard
              name={fullName || username || "User"}
              photoUrl={photoUrl}
              onPhotoChange={setPhoto}
              onNotice={(message) => setPhotoNotice(message)}
            />

            <section className="settings-figma__section">
              <h3 className="settings-figma__section-title">Profile</h3>
              <p className="settings-figma__section-note">
                Your contact details are private to your account. Add them here when you are ready.
              </p>
              <div className="settings-figma__fields settings-figma__fields--profile">
                <div className="settings-figma__field">
                  <label className="settings-figma__label" htmlFor="user-settings-fullname">
                    Fullname
                  </label>
                  <input
                    id="user-settings-fullname"
                    className="settings-figma__input"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
                <div className="settings-figma__field">
                  <label className="settings-figma__label" htmlFor="user-settings-username">
                    Username
                  </label>
                  <input
                    id="user-settings-username"
                    className="settings-figma__input settings-figma__input--account-readonly"
                    value={username}
                    readOnly
                  />
                </div>
                <div className="settings-figma__field settings-figma__field--full">
                  <label className="settings-figma__label" htmlFor="user-settings-email">
                    Your Email Address
                  </label>
                  <input
                    id="user-settings-email"
                    className="settings-figma__input"
                    value={email}
                    placeholder="Add your email address"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="settings-figma__field settings-figma__field--full">
                  <label className="settings-figma__label" htmlFor="user-settings-phone">
                    Your Phone Number
                  </label>
                  <input
                    id="user-settings-phone"
                    className="settings-figma__input"
                    value={phone}
                    placeholder="Add your phone number"
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="settings-figma__section settings-figma__section--account">
              <h3 className="settings-figma__section-title">Account Information</h3>
              <div className="settings-figma__fields settings-figma__fields--account">
                <div className="settings-figma__field">
                  <label className="settings-figma__label">Organization</label>
                  <input className="settings-figma__input settings-figma__input--account-readonly" value={organization} readOnly />
                </div>
                <div className="settings-figma__field">
                  <label className="settings-figma__label">Department</label>
                  <input className="settings-figma__input settings-figma__input--account-readonly" value={department} readOnly />
                </div>
              </div>
            </section>

            <section className="settings-figma__section settings-figma__section--admin-contact">
              <h3 className="settings-figma__section-title">Administrator Contact</h3>
              <p className="settings-figma__section-note">
                Contact the administrator who registered your account for credential or access help.
              </p>
              <div className="settings-figma__fields settings-figma__fields--admin-contact">
                <div className="settings-figma__field settings-figma__field--full">
                  <label className="settings-figma__label">Administrator</label>
                  <input className="settings-figma__input settings-figma__input--admin-readonly" value={adminContactName} readOnly />
                </div>
                <div className="settings-figma__field">
                  <label className="settings-figma__label">Admin Email</label>
                  <input className="settings-figma__input settings-figma__input--admin-readonly" value={adminContactEmail} readOnly />
                </div>
                <div className="settings-figma__field">
                  <label className="settings-figma__label">Admin Phone</label>
                  <input className="settings-figma__input settings-figma__input--admin-readonly" value={adminContactPhone} readOnly />
                </div>
              </div>
            </section>

            <section className="settings-figma__section settings-figma__section--pin">
              <h3 className="settings-figma__section-title">Change Password</h3>
              <div className="settings-figma__fields settings-figma__fields--pin">
                <PasswordField
                  id="user-settings-current-password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  startVisible={false}
                />
                <PasswordField
                  id="user-settings-new-password"
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
            </section>

            <div className="settings-figma__section-actions settings-figma__section-actions--right">
              <button type="button" className="settings-figma__cancel-btn" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="button" className="settings-figma__save-btn" disabled={saving} onClick={() => void handleSave()}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
