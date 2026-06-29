import type { RoleDef } from "../types";
import api from "./axios";

export const rolesApi = {
  list: () => api.get<RoleDef[]>("/roles").then((r) => r.data),

  update: (roleId: number, permissions: string[]) =>
    api.patch<RoleDef>(`/roles/${roleId}`, { permissions }).then((r) => r.data),
};
