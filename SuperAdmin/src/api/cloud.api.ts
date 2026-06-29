import type { CloudStorage, VerificationRequest } from "../types";
import api from "./axios";

export const cloudApi = {
  storage: () => api.get<CloudStorage>("/cloud/storage").then((r) => r.data),

  verificationList: () =>
    api.get<VerificationRequest[]>("/cloud/verification-list").then((r) => r.data),

  verify: (userId: number) =>
    api.post(`/cloud/verify/${userId}`).then((r) => r.data),

  reject: (userId: number) =>
    api.post(`/cloud/reject/${userId}`).then((r) => r.data),

  syncUser: (userId: number) =>
    api.post(`/cloud/sync/${userId}`).then((r) => r.data),
};
