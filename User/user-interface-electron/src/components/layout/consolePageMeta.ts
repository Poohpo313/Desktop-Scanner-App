export const CONSOLE_PAGE_TITLES = {
  Dashboard: "User Console Dashboard",
  Search: "Search Console",
  Documents: "Document Management Console",
  Devices: "Device Management Console",
  Settings: "System Settings Console",
  About: "About Desktop Scanner",
  Cloud: "Cloud Console",
  "Help Assistant": "Help Assistant Console",
  "System Diagnostics": "System Diagnostics Console",
  "Save Preferences": "Save Preferences",
  Scan: "Scan",
} as const;

export type ConsolePageSection = keyof typeof CONSOLE_PAGE_TITLES;

export const CONSOLE_PAGE_SUBTITLES: Record<ConsolePageSection, string> = {
  Dashboard: "Overview of your scanner, library, and application status.",
  Search: "Find documents by filenames, OCR text, or document numbers.",
  Documents: "Browse scanned files saved from your scan sessions and local folders.",
  Devices: "Detect and manage your connected scanners, printers, and sync devices.",
  Settings: "Configure application behavior and scan defaults.",
  About: "Application, license, and support information.",
  Cloud: "Cloud backup and sync are planned. Local storage is active on this device.",
  "Help Assistant": "Get quick help and common troubleshooting steps.",
  "System Diagnostics": "Run workstation, sync, scanner, and device health checks.",
  "Save Preferences":
    "Control automatic saving, multiple folders, file naming, and cloud sync destination.",
  Scan: "Configure scanner, preview, and save your document.",
};

export function getConsolePageTitle(section: ConsolePageSection | string): string {
  return CONSOLE_PAGE_TITLES[section as ConsolePageSection] ?? `${section} Console`;
}

export function getConsolePageSubtitle(section: ConsolePageSection | string): string {
  return (
    CONSOLE_PAGE_SUBTITLES[section as ConsolePageSection] ??
    "Manage your workspace from this console."
  );
}
