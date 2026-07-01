const PASSWORD_CHANGED_KEY = "bukolabs.userPasswordChanged";
const KNOWN_PASSWORD_KEY = "bukolabs.userKnownPassword";
export const DEFAULT_USER_PASSWORD = "user123";

function knownPasswordKey(userId: number) {
  return `${KNOWN_PASSWORD_KEY}.${userId}`;
}

function passwordChangedKey(userId: number) {
  return `${PASSWORD_CHANGED_KEY}.${userId}`;
}

export function readUserPasswordChanged(userId?: number | null) {
  try {
    if (userId != null) {
      const scoped = localStorage.getItem(passwordChangedKey(userId));
      if (scoped != null) return scoped === "true";
    }
    return localStorage.getItem(PASSWORD_CHANGED_KEY) === "true";
  } catch {
    return false;
  }
}

export function markUserPasswordChanged(userId?: number | null) {
  try {
    if (userId != null) {
      localStorage.setItem(passwordChangedKey(userId), "true");
    }
    localStorage.setItem(PASSWORD_CHANGED_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function loadUserKnownPassword(userId?: number | null) {
  try {
    if (userId != null) {
      const scoped = localStorage.getItem(knownPasswordKey(userId))?.trim();
      if (scoped) return scoped;
    }
    const legacy = localStorage.getItem(KNOWN_PASSWORD_KEY)?.trim();
    if (legacy) return legacy;
  } catch {
    /* ignore */
  }
  return DEFAULT_USER_PASSWORD;
}

export function saveUserKnownPassword(password: string, userId?: number | null) {
  try {
    if (userId != null) {
      localStorage.setItem(knownPasswordKey(userId), password);
    }
    localStorage.setItem(KNOWN_PASSWORD_KEY, password);
  } catch {
    /* ignore */
  }
}
