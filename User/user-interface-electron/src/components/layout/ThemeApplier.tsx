import { useEffect } from "react";
import { useSession } from "../../context/SessionContext";
import { applyAppTheme } from "../../lib/appTheme";
import { resolveSettings, SETTINGS_UPDATED_EVENT } from "../../lib/settingsStorage";

export function ThemeApplier() {
  const { session } = useSession();

  useEffect(() => {
    function syncTheme() {
      applyAppTheme(resolveSettings(session.userId).theme);
    }

    syncTheme();
    window.addEventListener(SETTINGS_UPDATED_EVENT, syncTheme);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, syncTheme);
    };
  }, [session.userId]);

  return null;
}
