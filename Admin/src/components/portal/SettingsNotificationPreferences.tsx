import { useRef, useState } from "react";
import {
  NOTIFICATION_PREFERENCE_ITEMS,
  type NotificationPreferenceId,
  type NotificationPreferences,
} from "../../data/demoSettingsNotifications";
import { useSettingsNotificationsStore } from "../../store/settingsNotificationsStore";
import PortalOverlay from "./PortalOverlay";
import ProfileChangesSavedModal from "./ProfileChangesSavedModal";

type Props = {
  onSave?: () => void;
};

function NotificationToggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      className={`settings-figma__toggle${checked ? " settings-figma__toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-figma__toggle-thumb" aria-hidden="true" />
    </button>
  );
}

export default function SettingsNotificationPreferences({ onSave }: Props) {
  const savePreferences = useSettingsNotificationsStore((state) => state.savePreferences);
  const storedPreferences = useSettingsNotificationsStore((state) => state.preferences);
  const lastSavedRef = useRef<NotificationPreferences>(storedPreferences);
  const [preferences, setPreferences] = useState<NotificationPreferences>(storedPreferences);
  const [saveClicked, setSaveClicked] = useState(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);

  const setPreference = (id: NotificationPreferenceId, enabled: boolean) => {
    setPreferences((current) => ({ ...current, [id]: enabled }));
  };

  const handleSave = () => {
    setSaveClicked(true);
    window.setTimeout(() => setSaveClicked(false), 450);

    const nextSaved = savePreferences(preferences);
    lastSavedRef.current = nextSaved;
    setPreferences(nextSaved);
    setSaveSuccessOpen(true);
    onSave?.();
  };

  const closeSaveSuccess = () => {
    setSaveSuccessOpen(false);
  };

  return (
    <>
      <header className="settings-figma__panel-head">
        <h1 className="settings-figma__panel-title">Notification Preferences</h1>
        <p className="settings-figma__panel-subtitle">
          Manage alerts and notifications related to device registration, scanner activity, support
          requests, and department-level system events.
        </p>
      </header>

      <div className="settings-figma__notifications-table-wrap">
        <table className="settings-figma__notifications-table">
          <thead>
            <tr>
              <th scope="col">Notification Type</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_PREFERENCE_ITEMS.map((item) => (
              <tr key={item.id}>
                <td>
                  <label htmlFor={`notification-toggle-${item.id}`}>{item.label}</label>
                </td>
                <td>
                  <NotificationToggle
                    id={`notification-toggle-${item.id}`}
                    checked={preferences[item.id]}
                    onChange={(enabled) => setPreference(item.id, enabled)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="settings-figma__notifications-actions">
        <button
          type="button"
          className={`settings-figma__save-btn${
            saveClicked ? " settings-figma__save-btn--clicked" : ""
          }`}
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>

      <PortalOverlay open={saveSuccessOpen} onClose={closeSaveSuccess}>
        <ProfileChangesSavedModal onClose={closeSaveSuccess} />
      </PortalOverlay>
    </>
  );
}
