import type { AdminUser } from "../types";
import api from "./axios";
import { unwrapList } from "./listResponse";

export const usersApi = {
  list: () => api.get<AdminUser[]>("/users").then((r) => unwrapList(r.data)),

  departments: () => api.get<string[]>("/users/lookups/departments").then((r) => r.data),

  companies: () => api.get<string[]>("/users/lookups/companies").then((r) => r.data),

  register: (body: {
    username: string;
    password: string;
    firstName?: string;
    middleInitial?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    department?: string;
    company?: string;
  }) => api.post<AdminUser>("/users/register", body).then((r) => r.data),

  update: (id: number, body: Partial<AdminUser>) =>
    api.patch<AdminUser>(`/users/${id}`, body).then((r) => r.data),

  recycleBin: () => api.get<AdminUser[]>("/users/recycle-bin").then((r) => unwrapList(r.data)),

  restore: (id: number) =>
    api.patch<{ success: boolean }>(`/users/${id}/restore`).then((r) => r.data),

  softDelete: (id: number) =>
    api.delete<{ success: boolean }>(`/users/${id}`).then((r) => r.data),

  permanentDelete: (id: number) =>
    api.delete<{ success: boolean }>(`/users/${id}/permanent`).then((r) => r.data),

  verifyCloud: (id: number) =>
    api.post<AdminUser>(`/users/${id}/verify-cloud`).then((r) => r.data),

  rejectCloud: (id: number) =>
    api.post<AdminUser>(`/users/${id}/reject-cloud`).then((r) => r.data),
};
