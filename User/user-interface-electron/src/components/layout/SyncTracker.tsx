import { useEffect } from "react";
import { useAppMode } from "../../context/AppModeContext";
import { useSession } from "../../context/SessionContext";
import { maybeRecordDailySync } from "../../lib/lastSyncStorage";
import { resolveSettings, SETTINGS_UPDATED_EVENT } from "../../lib/settingsStorage";

export function SyncTracker() {
  const { session } = useSession();
  const { isOnline } = useAppMode();
  const userId = session.userId;

  useEffect(() => {
    function runDailySync() {
      if (userId == null) return;
      const settings = resolveSettings(userId);
      maybeRecordDailySync(userId, settings.cloudSync, isOnline);
    }

    runDailySync();
    window.addEventListener(SETTINGS_UPDATED_EVENT, runDailySync);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, runDailySync);
    };
  }, [userId, isOnline]);

  return null;
}
