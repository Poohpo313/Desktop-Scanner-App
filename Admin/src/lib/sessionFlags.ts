const EXPLICIT_LOGOUT_KEY = "bukolabs-admin-explicit-logout";

export function markExplicitLogout() {
  localStorage.setItem(EXPLICIT_LOGOUT_KEY, "1");
}

export function clearExplicitLogout() {
  localStorage.removeItem(EXPLICIT_LOGOUT_KEY);
}

export function wasExplicitLogout() {
  return localStorage.getItem(EXPLICIT_LOGOUT_KEY) === "1";
}
