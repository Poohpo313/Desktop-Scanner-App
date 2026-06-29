import { useNavigate } from "react-router-dom";
import { NoInternetConnectionScreen } from "../components/auth/no-internet-connection";
import { useAppMode } from "../context/AppModeContext";

export default function NoInternetPage() {
  const navigate = useNavigate();
  const { setMode } = useAppMode();

  function handleContinueOffline() {
    setMode("offline");
    navigate("/dashboard", { replace: true });
  }

  function handleRetry() {
    navigate("/checking-connection", { replace: true });
  }

  return (
    <NoInternetConnectionScreen
      onRetry={handleRetry}
      onContinueOffline={handleContinueOffline}
    />
  );
}
