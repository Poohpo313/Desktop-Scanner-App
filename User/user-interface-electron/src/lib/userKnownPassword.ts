const PASSWORD_CHANGED_KEY = "bukolabs.userPasswordChanged";
const KNOWN_PASSWORD_KEY = "bukolabs.userKnownPassword";
export const DEFAULT_USER_PASSWORD = "user123";

export function readUserPasswordChanged() {
  try {
    return localStorage.getItem(PASSWORD_CHANGED_KEY) === "true";
  } catch {
    return false;
  }
}

export function markUserPasswordChanged() {
  try {
    localStorage.setItem(PASSWORD_CHANGED_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function loadUserKnownPassword() {
  try {
    const stored = localStorage.getItem(KNOWN_PASSWORD_KEY)?.trim();
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return readUserPasswordChanged() ? "" : DEFAULT_USER_PASSWORD;
}

export function saveUserKnownPassword(password: string) {
  try {
    localStorage.setItem(KNOWN_PASSWORD_KEY, password);
  } catch {
    /* ignore */
  }
}
