import AdminPortalPage from "../components/portal/AdminPortalPage";
import SettingsScreenBody from "../components/portal/SettingsScreenBody";
import { useNotificationStore } from "../store/notificationStore";
import "../styles/settings-figma-screen.css";

const FIGMA_ID = "2226:1705";

export function SettingsScreen() {
  const push = useNotificationStore((state) => state.push);

  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="settings"
      breadcrumb={[{ label: "Help", to: "/help-and-support-center-2226-2276" }, { label: "Settings" }]}
      showHeaderUtilities={false}
    >
      <SettingsScreenBody onSaveSettings={() => push("Settings saved", "success")} />
    </AdminPortalPage>
  );
}

export default SettingsScreen;
