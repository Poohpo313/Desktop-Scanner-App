import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import NotificationsCenterBody from "../components/portal/NotificationsCenterBody";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import { PORTAL } from "../routes/portalPaths";
import "../styles/notifications-center-screen.css";
import "../styles/page-transition.css";

export default function NotificationsCenterPage() {
  const { refreshToken } = useTopBarRefresh(async () => undefined, "Notifications refreshed");

  return (
    <ScreenRefreshFrame refreshToken={refreshToken}>
      <NotificationsCenterBody closeHref={PORTAL.dashboard} refreshToken={refreshToken} />
    </ScreenRefreshFrame>
  );
}
