import { useCallback, useState } from "react";
import { useNotificationStore } from "../store/notificationStore";

export function useTopBarRefresh(
  refreshFn: () => void | Promise<void>,
  successMessage = "Page refreshed"
) {
  const push = useNotificationStore((s) => s.push);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const onRefresh = useCallback(() => {
    if (refreshing) return;

    setRefreshing(true);
    Promise.resolve(refreshFn())
      .then(() => {
        setRefreshToken((token) => token + 1);
        push(successMessage, "success");
      })
      .catch(() => push("Refresh failed", "error"))
      .finally(() => window.setTimeout(() => setRefreshing(false), 700));
  }, [refreshFn, refreshing, push, successMessage]);

  return { onRefresh, refreshing, refreshToken };
}
