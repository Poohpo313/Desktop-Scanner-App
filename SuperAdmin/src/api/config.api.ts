import type { SystemConfig } from "../types";
import api from "./axios";

export const configApi = {
  get: () => api.get<SystemConfig>("/config").then((r) => r.data),

  patch: (body: Partial<SystemConfig>) =>
    api.patch<SystemConfig>("/config", body).then((r) => r.data),
};
