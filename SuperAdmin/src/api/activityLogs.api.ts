import api from "./axios";

export type ActivityLogRow = {
  id: string;
  action: string;
  activity?: string;
  timestamp: string;
  registeredUser?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  source?: string;
};

export const activityLogsApi = {
  list: () => api.get<ActivityLogRow[]>("/activity-logs").then((r) => r.data),
};
