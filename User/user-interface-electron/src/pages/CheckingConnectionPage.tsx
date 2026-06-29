import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckingConnectionScreen } from "../components/auth/CheckingConnectionScreen";
import { useAppMode } from "../context/AppModeContext";
import "../styles/auth-modals.css";

export default function CheckingConnectionPage() {
  const navigate = useNavigate();
  const { setMode } = useAppMode();

  useEffect(() => {
    let cancelled = false;

    async function probeGateway() {
      if (!navigator.onLine) {
        setMode("offline");
        navigate("/offline-dashboard", { replace: true });
        return;
      }

      const gateway = window.bukolabs?.gateway;
      if (!gateway) {
        setMode("offline");
        navigate("/offline-dashboard", { replace: true });
        return;
      }

      const result = await gateway.checkAvailable();
      if (cancelled) return;

      if (result.reachable) {
        setMode("online");
        void window.bukolabs?.auth?.syncPendingActivations?.();
        navigate("/dashboard", { replace: true });
        return;
      }

      setMode("offline");
      navigate("/offline-dashboard", { replace: true });
    }

    void probeGateway();
    return () => {
      cancelled = true;
    };
  }, [navigate, setMode]);

  return <CheckingConnectionScreen />;
}
