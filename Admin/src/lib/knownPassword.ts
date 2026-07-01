const KNOWN_PASSWORD_KEY = "bukolabs.adminKnownPassword";
const PASSWORD_CHANGED_KEY = "bukolabs.adminPasswordChanged";

/** Default password for newly registered administrator accounts (not the superadmin PIN). */
export const DEFAULT_ADMIN_PASSWORD = "admin123";

/** Legacy mistaken default that matched the superadmin PIN. */
export const LEGACY_SUPERADMIN_PIN_AS_PASSWORD = "123456";

export function readAdminPasswordChanged() {
  try {
    return localStorage.getItem(PASSWORD_CHANGED_KEY) === "true";
  } catch {
    return false;
  }
}

export function markAdminPasswordChanged() {
  try {
    localStorage.setItem(PASSWORD_CHANGED_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function loadAdminKnownPassword() {
  try {
    const stored = localStorage.getItem(KNOWN_PASSWORD_KEY)?.trim();
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return readAdminPasswordChanged() ? "" : DEFAULT_ADMIN_PASSWORD;
}

export function saveAdminKnownPassword(password: string) {
  try {
    localStorage.setItem(KNOWN_PASSWORD_KEY, password);
  } catch {
    /* ignore */
  }
}

export function isLegacySuperadminPinValue(value: string) {
  return value.trim() === LEGACY_SUPERADMIN_PIN_AS_PASSWORD;
}
