import { AboutPageView } from "../components/about";
import { useAppMode } from "../context/AppModeContext";
import { OfflineSectionView } from "../components/offline";

export default function HelpPage() {
  const { isOnline } = useAppMode();

  if (!isOnline) {
    return <OfflineSectionView section="About" screenSlug="section-offline-about" />;
  }

  return <AboutPageView />;
}
