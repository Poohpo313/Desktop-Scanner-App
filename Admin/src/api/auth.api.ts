import api from "./axios";

export type LoginResponse = {
  accessToken: string;
  role: "admin";
  userId: number;
};

export type RecoverySubmitResponse = {
  requestId: string;
  requestNumber: number;
  status: string;
  phase: "under-review" | "identity-verification" | "credentials-released";
  submittedAt: string;
};

export const authApi = {
  login: (body: { username: string; password: string }) =>
    api.post<LoginResponse>("/auth/admin/login", body).then((r) => r.data),

  refresh: () => api.post<LoginResponse>("/auth/refresh").then((r) => r.data),

  me: () =>
    api
      .get<{
        userId: number;
        username: string;
        role: string;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
        phoneNumber?: string | null;
        company?: string | null;
        department?: string | null;
        departments?: string[];
      }>("/auth/me")
      .then((r) => r.data),

  logout: () => api.post<{ success: boolean }>("/auth/logout").then((r) => r.data),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.post<{ success: boolean }>("/auth/change-password", body).then((r) => r.data),

  updateProfile: (body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }) =>
    api
      .patch<{
        userId: number;
        username: string;
        role: string;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
        phoneNumber?: string | null;
        company?: string | null;
        department?: string | null;
      }>("/auth/profile", body)
      .then((r) => r.data),

  submitRecovery: (body: {
    identifier: string;
    channel: "email" | "sms" | "physical";
    username?: string;
  }) =>
    api.post<RecoverySubmitResponse>("/auth/admin/forgot-credentials", body).then((r) => r.data),

  getRecoveryStatus: (requestId: string) =>
    api
      .get<RecoverySubmitResponse>(`/auth/recovery/${encodeURIComponent(requestId)}/status`)
      .then((r) => r.data),
};
