export type SettingsActivityHistoryViewAction =
  | "device-details"
  | "device-update-details"
  | "registration-approval-details"
  | "support-request-details"
  | "scanner-configuration-update-details";

export type SettingsActivityHistoryRow = {
  id: number;
  activity: string;
  dateLine: string;
  timeLine: string;
  viewAction?: SettingsActivityHistoryViewAction;
};

export const SETTINGS_ACTIVITY_HISTORY_ROWS: SettingsActivityHistoryRow[] = [];

export const SETTINGS_ACTIVITY_HISTORY_TOTAL = 0;