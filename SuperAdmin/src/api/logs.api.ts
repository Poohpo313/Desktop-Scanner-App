import api from "./axios";

export type AuditLog = {
  id?: string | number;
  dateTime?: string;
  timestamp?: string;
  registeredUser?: string;
  user?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  activity?: string;
  action?: string;
  source?: string;
  details?: string | Record<string, unknown> | null;
  ipAddress?: string;
};

export type LogsStatus = {
  todayCount: number;
  archiveDirectory: string;
  archivedFiles: string[];
  lastArchivedFile: string | null;
  resetsDailyAt: string;
};

export const logsApi = {
  list: () => api.get<AuditLog[]>("/logs").then((response) => response.data),

  status: () => api.get<LogsStatus>("/logs/status").then((response) => response.data),
};
