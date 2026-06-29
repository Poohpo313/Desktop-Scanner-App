export type ScannerConfigurationUpdateBadgeStyle = "interval" | "enabled";

export type ScannerConfigurationUpdateChangeRow = {
  field: string;
  previousValue: string;
  previousTone?: "default" | "disabled";
  updatedValue: string;
  badgeStyle: ScannerConfigurationUpdateBadgeStyle;
};

export const SETTINGS_SCANNER_CONFIGURATION_UPDATE_DETAILS = {
  updatedBy: "",
  updatedOn: "",
  changes: [] as ScannerConfigurationUpdateChangeRow[],
};