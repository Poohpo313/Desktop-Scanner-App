import { OfflineSectionView } from "../components/offline";
import { SettingsPageView } from "../components/settings/SettingsPageView";
import { useAppMode } from "../context/AppModeContext";
import "../styles/settings-page.css";

export default function SettingsPage() {
  const { isOnline } = useAppMode();

  if (!isOnline) {
    return (
      <OfflineSectionView
        section="Settings"
        screenSlug="section-offline-settings"
        showSettingsTabs
      />
    );
  }

  return <SettingsPageView />;
}
