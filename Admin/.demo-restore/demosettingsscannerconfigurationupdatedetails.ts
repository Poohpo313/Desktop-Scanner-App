export type ScannerConfigurationUpdateBadgeStyle = "interval" | "enabled";

export type ScannerConfigurationUpdateChangeRow = {
  field: string;
  previousValue: string;
  previousTone?: "default" | "disabled";
  updatedValue: string;
  badgeStyle: ScannerConfigurationUpdateBadgeStyle;
};

export const SETTINGS_SCANNER_CONFIGURATION_UPDATE_DETAILS = {
  updatedBy: "Assigned Admin",
  updatedOn: "May 24, 2026 - 08:30 AM",
  changes: [
    {
      field: "Sync Interval",
      previousValue: "30 Minutes",
      previousTone: "default",
      updatedValue: "15 Minutes",
      badgeStyle: "interval",
    },
    {
      field: "Auto Sync",
      previousValue: "DISABLED",
      previousTone: "disabled",
      updatedValue: "ENABLED",
      badgeStyle: "enabled",
    },
    {
      field: "Alert Notifications",
      previousValue: "DISABLED",
      previousTone: "disabled",
      updatedValue: "ENABLED",
      badgeStyle: "enabled",
    },
  ] satisfies ScannerConfigurationUpdateChangeRow[],
};
