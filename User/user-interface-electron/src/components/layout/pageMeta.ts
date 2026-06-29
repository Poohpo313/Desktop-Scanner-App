export const PAGE_META: Record<string, { title: string; crumb: string }> = {
  "/dashboard": { title: "Dashboard", crumb: "Dashboard" },
  "/offline-dashboard": { title: "Offline Dashboard", crumb: "Offline Dashboard" },
  "/scan": { title: "Scan", crumb: "Scan" },
  "/files": { title: "Documents", crumb: "Documents" },
  "/search": { title: "Search", crumb: "Search" },
  "/devices": { title: "Devices", crumb: "Devices" },
  "/print": { title: "Print", crumb: "Print" },
  "/print/confirm": { title: "Confirm Print Job", crumb: "Confirm Print" },
  "/print/completed": { title: "Print Completed", crumb: "Print Completed" },
  "/settings": { title: "Settings", crumb: "Settings" },
  "/settings/save-preferences": { title: "Save Preferences", crumb: "Save Preferences" },
  "/cloud": { title: "Cloud", crumb: "Cloud" },
  "/help-assistant": { title: "Help Assistant", crumb: "Help Assistant" },
  "/reports": { title: "Reports", crumb: "Reports" },
  "/help": { title: "About Desktop Scanner", crumb: "About" },
};

export function getPageMeta(pathname: string) {
  return PAGE_META[pathname] ?? { title: "Desktop Scanner", crumb: "App" };
}
