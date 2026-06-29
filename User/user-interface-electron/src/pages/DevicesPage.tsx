import { DevicesPageView } from "../components/devices/DevicesPageView";
import { OfflineSectionView } from "../components/offline";
import { useAppMode } from "../context/AppModeContext";
import "../styles/devices-page.css";

export default function DevicesPage() {
  const { isOnline } = useAppMode();

  if (!isOnline) {
    return <OfflineSectionView section="Devices" screenSlug="section-offline-devices" />;
  }

  return <DevicesPageView />;
}
