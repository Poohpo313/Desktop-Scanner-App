import type { RevocationRecord, SerialKey } from "../types";
import api from "./axios";
import { unwrapList } from "./listResponse";
import { normalizeRevocationList } from "../lib/normalizeRevocations";

export const keysApi = {
  list: () => api.get<SerialKey[]>("/keys").then((r) => unwrapList(r.data)),

  revocations: () =>
    api.get<RevocationRecord[]>("/keys/revocations").then((r) => normalizeRevocationList(unwrapList(r.data))),

  generate: () => api.post<SerialKey>("/keys/generate").then((r) => r.data),

  generateBulk: (quantity: number, options?: {
    company?: string;
    department?: string;
    expirationDays?: number;
  }) =>
    api.post<SerialKey[]>("/keys/generate-bulk", { count: quantity, ...options }).then((r) => r.data),

  deleteAll: () => api.delete<{ deleted: number }>("/keys/all").then((r) => r.data),

  assign: (serialId: number, userId: number) =>
    api.post<SerialKey>("/keys/assign", { serialId, userId }).then((r) => r.data),

  revoke: (serialId: number) =>
    api.patch<SerialKey>(`/keys/${serialId}/revoke`).then((r) => r.data),

  deactivate: (serialId: number) =>
    api.patch<SerialKey>(`/keys/${serialId}/deactivate`).then((r) => r.data),

  permanentDelete: (serialId: number) =>
    api.delete<{ success: boolean }>(`/keys/${serialId}/permanent`).then((r) => r.data),

  approveRevocationRequest: (requestId: number) =>
    api.patch<{ success: boolean }>(`/keys/revocation-requests/${requestId}/approve`).then((r) => r.data),

  denyRevocationRequest: (requestId: number) =>
    api.patch<{ success: boolean }>(`/keys/revocation-requests/${requestId}/deny`).then((r) => r.data),

  restoreRevokedKey: (serialId: number) =>
    api.patch<SerialKey>(`/keys/${serialId}/restore`).then((r) => r.data),

  recycleBin: () => api.get<SerialKey[]>("/keys/recycle-bin").then((r) => unwrapList(r.data)),

  modifyExpiry: (serialId: number, payload: { durationDays: number; note?: string }) =>
    api.patch(`/keys/${serialId}/modify-expiry`, payload).then((r) => r.data),

  listExtensionRequests: () =>
    api.get("/keys/extension-requests/superadmin/pending").then((r) => unwrapList(r.data)),

  approveExtensionRequest: (
    requestId: number,
    payload: { requestedDays: number; superadminNote?: string },
  ) => api.post(`/keys/extension-requests/${requestId}/approve`, payload).then((r) => r.data),

  rejectExtensionRequest: (requestId: number, note?: string) =>
    api.post(`/keys/extension-requests/${requestId}/superadmin-reject`, { note }).then((r) => r.data),
};
