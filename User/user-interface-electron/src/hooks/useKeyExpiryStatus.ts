import { useCallback, useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";

export type MyKeyStatus = {
  key: {
    serialKeyMasked: string;
    statusLabel: string;
    activatedOn: string;
    expiresAt: string | null;
    durationDays: number | null;
    daysRemaining: number | null;
    daysExpired: number | null;
    threshold: string;
    isExpired: boolean;
    hasExpiry: boolean;
  };
  assignedAdmin: {
    adminName: string | null;
    email: string | null;
    phoneNumber: string | null;
    department: string | null;
  } | null;
  pendingRequest: { requestId: number; status: string; type: string } | null;
};

export function useKeyExpiryStatus() {
  const { session } = useSession();
  const [status, setStatus] = useState<MyKeyStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session.token || !window.bukolabs?.keys?.getStatus) {
      setStatus(null);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await window.bukolabs.keys.getStatus({ userId: session.userId ?? undefined });
    if (result.success && result.data) {
      setStatus(result.data as MyKeyStatus);
    } else {
      setStatus(null);
      setError(result.error ?? null);
    }
    setLoading(false);
  }, [session.token, session.userId]);

  useEffect(() => {
    void refresh();
    const pollMs =
      status?.key?.hasExpiry && (status.key.daysRemaining ?? 999) <= 30 ? 60_000 : 5 * 60_000;
    const interval = window.setInterval(() => void refresh(), pollMs);
    return () => window.clearInterval(interval);
  }, [refresh, status?.key?.daysRemaining, status?.key?.hasExpiry]);

  useEffect(() => {
    function handleFocus() {
      void refresh();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  return { status, loading, error, refresh };
}
