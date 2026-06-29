import { useNavigate } from "react-router-dom";
import DesktopScannerSplashScreen from "../components/DesktopScannerSplashScreen";

const FIGMA_ID = "2212:2597";

export function AdminSplashScreen() {
  const navigate = useNavigate();

  return (
    <div data-figma-id={FIGMA_ID} data-screen="admin-splash">
      <DesktopScannerSplashScreen onComplete={() => navigate("/admin-login", { replace: true })} />
    </div>
  );
}

export default AdminSplashScreen;
