import type { SerialKey } from "../types";
import api from "./axios";
import { unwrapList } from "./listResponse";

export const keysApi = {
  list: () => api.get<SerialKey[]>("/keys").then((r) => unwrapList(r.data)),

  generate: () => api.post<SerialKey>("/keys/generate").then((r) => r.data),

  assign: (serialId: number, userId: number) =>
    api.post<SerialKey>("/keys/assign", { serialId, userId }).then((r) => r.data),

  revoke: (serialId: number) =>
    api.patch<SerialKey>(`/keys/${serialId}/revoke`).then((r) => r.data),

  deactivate: (serialId: number) =>
    api.patch<SerialKey>(`/keys/${serialId}/deactivate`).then((r) => r.data),

  createRevocationRequest: (payload: {
    requestType: "key" | "device";
    targetId: number;
    reason?: string;
  }) => api.post("/keys/revocation-requests", payload).then((r) => r.data),

  listRevocationRequests: () =>
    api
      .get<
        Array<{
          requestId: number;
          requestType: "key" | "device";
          targetId: number;
          status: string;
          createdAt: string;
          referenceId: string;
        }>
      >("/keys/revocation-requests")
      .then((r) => r.data),

  cancelRevocationRequest: (requestId: number) =>
    api.patch<{ success: boolean }>(`/keys/revocation-requests/${requestId}/cancel`).then((r) => r.data),

  listExtensionRequests: () =>
    api.get("/keys/extension-requests/pending").then((r) => unwrapList(r.data)),

  forwardExtensionRequest: (requestId: number, adminNote?: string) =>
    api.post(`/keys/extension-requests/${requestId}/forward`, { adminNote }).then((r) => r.data),

  rejectExtensionRequest: (requestId: number, note?: string) =>
    api.post(`/keys/extension-requests/${requestId}/reject`, { note }).then((r) => r.data),
};
