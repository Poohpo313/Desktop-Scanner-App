import { OfflineSectionView } from "../components/offline";
import { SavePreferencesPageView } from "../components/settings/SavePreferencesPageView";
import { useAppMode } from "../context/AppModeContext";
import "../styles/save-preferences-page.css";

export default function SavePreferencesPage() {
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

  return <SavePreferencesPageView />;
}
