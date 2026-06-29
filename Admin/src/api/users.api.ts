import type { AdminUser } from "../types";
import api from "./axios";
import { unwrapList } from "./listResponse";

export const usersApi = {
  list: () => api.get<AdminUser[]>("/users").then((r) => unwrapList(r.data)),

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

  remove: (id: number) =>
    api.delete<{ success: boolean }>(`/users/${id}`).then((r) => r.data),
};
