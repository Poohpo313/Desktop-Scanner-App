export const OFFLINE_UNAVAILABLE_PATHS = new Set([
  "/dashboard",
  "/offline-dashboard",
  "/search",
  "/files",
  "/devices",
  "/settings",
  "/settings/save-preferences",
  "/help",
  "/cloud",
]);

export function isOfflineUnavailablePath(pathname: string): boolean {
  if (OFFLINE_UNAVAILABLE_PATHS.has(pathname)) return true;
  return pathname.startsWith("/settings/");
}
