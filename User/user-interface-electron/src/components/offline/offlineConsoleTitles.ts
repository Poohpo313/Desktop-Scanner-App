import { CONSOLE_PAGE_SUBTITLES } from "../layout/consolePageMeta";

const OFFLINE_CONSOLE_TITLES: Record<string, string> = {
  Dashboard: "User Console Dashboard",
  Search: "Search Console",
  Documents: "Document Management Console",
  Devices: "Device Management Console",
  Settings: "System Settings Console",
  About: "About Desktop Scanner",
  "Help Assistant": "Help Assistant Console",
};

export {
  CONSOLE_PAGE_SUBTITLES,
  CONSOLE_PAGE_TITLES,
  getConsolePageSubtitle,
  getConsolePageTitle,
  type ConsolePageSection,
} from "../layout/consolePageMeta";
export const HELP_ASSISTANT_CONSOLE_TITLE = OFFLINE_CONSOLE_TITLES["Help Assistant"];

export const HELP_ASSISTANT_ONLINE_SUBTITLE = CONSOLE_PAGE_SUBTITLES["Help Assistant"];

export const OFFLINE_UNAVAILABLE_SUBTITLE = "This section is unavailable in offline mode.";

export type OfflineConsoleBreadcrumbItem = {
  label: string;
  active?: boolean;
};

export const OFFLINE_DASHBOARD_BREADCRUMB: OfflineConsoleBreadcrumbItem[] = [
  { label: "Home" },
  { label: "Dashboard", active: true },
];

export function getOfflineConsoleBreadcrumb(section: string): OfflineConsoleBreadcrumbItem[] | undefined {
  if (section === "Dashboard") return OFFLINE_DASHBOARD_BREADCRUMB;
  return undefined;
}

export function getOfflineConsoleTitle(section: string): string {
  return OFFLINE_CONSOLE_TITLES[section] ?? `${section} Console`;
}
