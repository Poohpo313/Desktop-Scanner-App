import { useEffect, useRef, useState } from "react";
import { useAppMode } from "../../context/AppModeContext";
import { useGatewayStatus } from "../../context/GatewayStatusContext";
import { ConnectionLostModal } from "./ConnectionLostModal";

export function NetworkMonitor() {
  const { mode, isOnline } = useAppMode();
  const { reachable, checkNow } = useGatewayStatus();
  const [showLostModal, setShowLostModal] = useState(false);
  const wasReachableRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isOnline || reachable == null) return;

    if (reachable) {
      wasReachableRef.current = true;
      if (mode === "offline") {
        setShowLostModal(false);
      }
      return;
    }

    if (wasReachableRef.current === true || mode === "online") {
      setShowLostModal(true);
    }
    wasReachableRef.current = false;
  }, [isOnline, reachable, mode]);

  useEffect(() => {
    if (isOnline && reachable) {
      wasReachableRef.current = true;
    }
  }, [isOnline, reachable]);

  async function retryConnection() {
    setShowLostModal(false);
    const ok = await checkNow();
    if (!ok) {
      setShowLostModal(true);
    }
  }

  return (
    <ConnectionLostModal
      open={showLostModal}
      onClose={() => setShowLostModal(false)}
      onRetry={() => void retryConnection()}
      variant="gateway"
    />
  );
}
