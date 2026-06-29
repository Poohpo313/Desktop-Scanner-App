import { useNavigate } from "react-router-dom";
import DesktopScannerSplashScreen from "../components/DesktopScannerSplashScreen";
import { PORTAL } from "../routes/portalPaths";

export default function SplashPage() {
  const navigate = useNavigate();

  return <DesktopScannerSplashScreen onComplete={() => navigate(PORTAL.login, { replace: true })} />;
}
