import { WifiOff, ServerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppMode } from "../../context/AppModeContext";
import { GATEWAY_SETTINGS_NAV_STATE } from "../../lib/gatewaySettingsNavigation";

type Props = {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  variant?: "internet" | "gateway";
};

export function ConnectionLostModal({
  open,
  onClose,
  onRetry,
  variant = "internet",
}: Props) {
  const navigate = useNavigate();
  const { setMode } = useAppMode();

  if (!open) return null;

  function goOffline() {
    setMode("offline");
    onClose();
    navigate("/offline-dashboard", { replace: true });
  }

  function retryConnection() {
    if (onRetry) {
      onRetry();
      return;
    }
    onClose();
    navigate("/checking-connection", { replace: true });
  }

  function configureGateway() {
    onClose();
    navigate("/settings", { state: GATEWAY_SETTINGS_NAV_STATE });
  }

  const isGateway = variant === "gateway";

  return (
    <div className="connection-lost-backdrop" role="presentation">
      <section
        className="connection-lost-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="connection-lost-title"
      >
        <div className="connection-lost-modal__icon" aria-hidden="true">
          {isGateway ? <ServerOff size={34} strokeWidth={1.8} /> : <WifiOff size={34} strokeWidth={1.8} />}
        </div>
        <h2 id="connection-lost-title" className="connection-lost-modal__title">
          {isGateway ? "Gateway Unreachable" : "No Internet Connection"}
        </h2>
        <p className="connection-lost-modal__message">
          {isGateway
            ? "The Bukolabs gateway server is not responding. Your administrator may need to start the background service, or you may need to update the gateway address in Settings. You can retry now or continue in offline mode."
            : "Your internet connection was lost. You can retry now or continue in offline mode and keep scanning locally."}
        </p>
        <div className="connection-lost-modal__actions">
          <button
            type="button"
            className="connection-lost-modal__btn connection-lost-modal__btn--primary"
            onClick={retryConnection}
          >
            Retry Connection
          </button>
          {isGateway ? (
            <button
              type="button"
              className="connection-lost-modal__btn connection-lost-modal__btn--secondary"
              onClick={configureGateway}
            >
              Configure Gateway
            </button>
          ) : null}
          <button
            type="button"
            className="connection-lost-modal__btn connection-lost-modal__btn--secondary"
            onClick={goOffline}
          >
            Go Offline
          </button>
        </div>
      </section>
    </div>
  );
}
