import api from "./axios";

export type ActivityLogApiRow = {
  id: string;
  action: string;
  details?: Record<string, unknown> | null;
  timestamp: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export const activityLogsApi = {
  list: () => api.get<ActivityLogApiRow[]>("/activity-logs").then((r) => r.data),
};
