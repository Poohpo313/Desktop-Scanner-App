export type SettingsDeviceUpdateChangeRow = {
  field: string;
  previousValue: string;
  updatedValue: string;
};

export const SETTINGS_DEVICE_UPDATE_DETAILS = {
  updatedOn: "",
  updatedBy: "",
  changes: [] as SettingsDeviceUpdateChangeRow[],
};