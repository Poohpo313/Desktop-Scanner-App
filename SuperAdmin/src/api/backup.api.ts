import type { BackupRecord } from "../types";
import api from "./axios";

export const backupApi = {
  history: () => api.get<BackupRecord[]>("/backup/history").then((r) => r.data),

  manual: () => api.post<BackupRecord>("/backup/manual").then((r) => r.data),

  restore: (backupId: number) =>
    api.post<{ id: string; status: string }>(`/backup/${backupId}/restore`).then((r) => r.data),

  remove: (backupId: number) =>
    api.delete<{ id: string; deleted: boolean }>(`/backup/${backupId}`).then((r) => r.data),
};
