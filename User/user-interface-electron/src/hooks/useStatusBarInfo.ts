import { useEffect, useState } from "react";
import { useAppMode } from "../context/AppModeContext";
import { useSession } from "../context/SessionContext";
import { getLastSyncLabel, LAST_SYNC_UPDATED_EVENT } from "../lib/lastSyncStorage";
import { resolveSettings, SETTINGS_UPDATED_EVENT } from "../lib/settingsStorage";

export function useStatusBarInfo() {
  const { session } = useSession();
  const { isOnline } = useAppMode();
  const userId = session.userId;
  const [, refreshToken] = useState(0);

  useEffect(() => {
    function refresh() {
      refreshToken((value) => value + 1);
    }

    window.addEventListener(SETTINGS_UPDATED_EVENT, refresh);
    window.addEventListener(LAST_SYNC_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, refresh);
      window.removeEventListener(LAST_SYNC_UPDATED_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    refreshToken((value) => value + 1);
  }, [userId, isOnline]);

  const settings = resolveSettings(userId);

  return {
    primaryFolder: settings.primaryFolder,
    databaseType: settings.databaseType,
    lastSyncLabel: getLastSyncLabel(userId, isOnline),
  };
}
