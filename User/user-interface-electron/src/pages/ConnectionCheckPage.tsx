import { useNavigate } from "react-router-dom";
import { FigmaUserScreen } from "../components/FigmaUserScreen";
import { useAppMode } from "../context/AppModeContext";

export default function ConnectionCheckPage() {
  const navigate = useNavigate();
  const { setMode } = useAppMode();

  function goOnline() {
    setMode("online");
    navigate("/dashboard", { replace: true });
  }

  function goOffline() {
    setMode("offline");
    navigate("/offline-dashboard", { replace: true });
  }

  return (
    <FigmaUserScreen slug="checking-connection" variant="full">
      <button type="button" className="login__button" onClick={goOnline}>
        YES — Continue Online
      </button>
      <button type="button" className="login__button login__button--outline" onClick={goOffline}>
        NO — Continue Offline
      </button>
    </FigmaUserScreen>
  );
}
