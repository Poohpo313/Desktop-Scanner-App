import { isOfflineUnavailablePath } from "../offline";

/** Routes that use ConsolePageHeader and collapse the global TopBar. */
export function isConsolePageRoute(pathname: string, isOnline: boolean): boolean {
  const isOfflineSection = !isOnline && isOfflineUnavailablePath(pathname);
  const isScanPage = pathname === "/scan";
  const isSearchPage = pathname === "/search";
  const isFilesPage = pathname === "/files";
  const isDevicesPage = pathname === "/devices";
  const isSettingsPage = pathname === "/settings" || pathname.startsWith("/settings/");
  const isHelpAssistantPage =
    pathname === "/help-assistant" || pathname === "/help" || pathname.startsWith("/help/");
  const isCloudPage = pathname === "/cloud";
  const isPrintPage = pathname === "/print" || pathname.startsWith("/print/");

  return (
    pathname === "/dashboard" ||
    pathname === "/offline-dashboard" ||
    pathname === "/help" ||
    isScanPage ||
    isSearchPage ||
    isFilesPage ||
    isDevicesPage ||
    isSettingsPage ||
    isCloudPage ||
    isHelpAssistantPage ||
    isPrintPage ||
    isOfflineSection
  );
}
