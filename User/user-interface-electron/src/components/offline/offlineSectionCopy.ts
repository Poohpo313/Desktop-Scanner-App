export const OFFLINE_SECTION_COPY: Record<string, string> = {
  Dashboard:
    "The Dashboard requires an internet connection or Cloud Sync to load your data and insights. You can still scan and save documents locally on this device.",
  Search:
    "The Search section requires an internet connection or Cloud Sync to search synced or cloud-connected files. You can still scan and save documents locally on this device.",
  Documents:
    "The Documents section requires an internet connection or Cloud Sync to browse your synced files. You can still scan and save documents locally on this device.",
  Devices:
    "The Devices section requires an internet connection or Cloud Sync to manage connected or remote devices. You can still scan documents locally on this device.",
  Settings:
    "Settings sync and advanced preferences require an internet connection or Cloud Sync. You can still scan documents locally.",
  About:
    "The About section requires an internet connection to load support information, release notes, or other online resources. You can still scan and save documents locally on this device.",
  "Help Assistant":
    "Help topics and cloud support require an internet connection or Cloud Sync. You can still scan and save documents locally on this device.",
};

export function getOfflineSectionMessage(section: string): string {
  return (
    OFFLINE_SECTION_COPY[section] ??
    `The ${section} section requires an internet connection or Cloud Sync. You can still scan and save documents locally on this device.`
  );
}
