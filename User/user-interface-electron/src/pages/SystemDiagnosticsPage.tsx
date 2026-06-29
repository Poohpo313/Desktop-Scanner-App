import { SystemDiagnosticsPageView } from "../components/help/SystemDiagnosticsPageView";
import { OfflineSectionView } from "../components/offline";
import { useAppMode } from "../context/AppModeContext";

export default function SystemDiagnosticsPage() {
  const { isOnline } = useAppMode();

  if (!isOnline) {
    return <OfflineSectionView section="System Diagnostics" screenSlug="section-offline-about" />;
  }

  return <SystemDiagnosticsPageView />;
}
