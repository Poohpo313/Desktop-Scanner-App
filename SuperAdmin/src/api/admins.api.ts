import type { AdminAccount } from "../types";
import api from "./axios";
import { unwrapList } from "./listResponse";

export const adminsApi = {
  list: () => api.get<AdminAccount[]>("/admins").then((r) => r.data),

  recycleBin: () => api.get<AdminAccount[]>("/admins/recycle-bin").then((r) => unwrapList(r.data)),

  create: (body: {
    username: string;
    password: string;
    firstName?: string;
    middleInitial?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    department?: string;
    departments?: string[];
    company?: string;
    roleId?: number;
  }) => api.post<AdminAccount>("/admins", body).then((r) => r.data),

  update: (id: number, body: Partial<AdminAccount>) =>
    api.patch<AdminAccount>(`/admins/${id}`, body).then((r) => r.data),

  softDelete: (id: number) => api.delete<AdminAccount>(`/admins/${id}`).then((r) => r.data),

  permanentDelete: (id: number) =>
    api.delete<{ success: boolean }>(`/admins/${id}/permanent`).then((r) => r.data),

  restore: (id: number) => api.post<AdminAccount>(`/admins/${id}/restore`).then((r) => r.data),
};
