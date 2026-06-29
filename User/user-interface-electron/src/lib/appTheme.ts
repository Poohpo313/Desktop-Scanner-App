import { APP_STORAGE_KEYS } from "../config/appStorage";
import { resolveSettings } from "./settingsStorage";

export function normalizeTheme(_theme: string): "Light" {
  return "Light";
}

export function applyAppTheme(_theme?: string) {
  document.documentElement.dataset.theme = "light";
}

export function bootstrapAppTheme() {
  applyAppTheme("Light");

  try {
    const sessionRaw = localStorage.getItem(APP_STORAGE_KEYS.session);
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw) as { userId?: number | null };
      if (session.userId != null) {
        applyAppTheme(resolveSettings(session.userId).theme);
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
}
