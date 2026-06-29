export type SettingsDeviceUpdateChangeRow = {
  field: string;
  previousValue: string;
  updatedValue: string;
};

export const SETTINGS_DEVICE_UPDATE_DETAILS = {
  updatedOn: "May 27, 2025 • 02:45 PM",
  updatedBy: "Assigned Admin",
  changes: [
    {
      field: "Device Name",
      previousValue: "Scanner A",
      updatedValue: "Front Desk Scanner",
    },
    {
      field: "Location",
      previousValue: "Main Office",
      updatedValue: "Operations Office",
    },
    {
      field: "Department",
      previousValue: "Administration",
      updatedValue: "Operations",
    },
  ] satisfies SettingsDeviceUpdateChangeRow[],
};
