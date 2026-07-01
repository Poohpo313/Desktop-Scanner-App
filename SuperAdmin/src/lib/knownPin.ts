const KNOWN_PIN_KEY = "bukolabs.superadminKnownPin";
const PIN_CHANGED_KEY = "bukolabs.superadminPinChanged";

/** Superadmin account PIN (6 digits). Not used for administrator officer passwords. */
export const DEFAULT_SUPERADMIN_PIN = "123456";

export function readSuperAdminPinChanged() {
  try {
    return localStorage.getItem(PIN_CHANGED_KEY) === "true";
  } catch {
    return false;
  }
}

export function markSuperAdminPinChanged() {
  try {
    localStorage.setItem(PIN_CHANGED_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function loadSuperAdminKnownPin() {
  try {
    const stored = localStorage.getItem(KNOWN_PIN_KEY)?.trim();
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_SUPERADMIN_PIN;
}

export function saveSuperAdminKnownPin(pin: string) {
  try {
    localStorage.setItem(KNOWN_PIN_KEY, pin);
  } catch {
    /* ignore */
  }
}
