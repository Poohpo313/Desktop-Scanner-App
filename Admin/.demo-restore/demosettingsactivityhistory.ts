export type SettingsActivityHistoryRow = {
  id: number;
  activity: string;
  dateLine: string;
  timeLine: string;
};

export const SETTINGS_ACTIVITY_HISTORY_ROWS: SettingsActivityHistoryRow[] = [
  {
    id: 1,
    activity: "Registered Scanner SCN-102",
    dateLine: "May 28, 2026",
    timeLine: "09:15 AM",
  },
  {
    id: 2,
    activity: "Updated Device Information",
    dateLine: "May 27, 2026",
    timeLine: "02:45 PM",
  },
  {
    id: 3,
    activity: "Approved Device Registration",
    dateLine: "May 26, 2026",
    timeLine: "11:20 AM",
  },
  {
    id: 4,
    activity: "Submitted Support Request",
    dateLine: "May 25, 2026",
    timeLine: "03:10 PM",
  },
  {
    id: 5,
    activity: "Updated Scanner Configuration",
    dateLine: "May 24, 2026",
    timeLine: "08:30 AM",
  },
];

export const SETTINGS_ACTIVITY_HISTORY_TOTAL = SETTINGS_ACTIVITY_HISTORY_ROWS.length;
