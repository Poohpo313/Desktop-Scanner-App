import api from "./axios";

export type SuperAdminLoginResponse = {
  accessToken: string;
  role: "superadmin";
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
  login: (body: { pin: string }) =>
    api.post<SuperAdminLoginResponse>("/auth/superadmin/login", body).then((r) => r.data),

  refresh: () => api.post<SuperAdminLoginResponse>("/auth/refresh").then((r) => r.data),

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
      }>("/auth/me")
      .then((r) => r.data),

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
      }>("/auth/profile", body)
      .then((r) => r.data),

  logout: () => api.post<{ success: boolean }>("/auth/logout").then((r) => r.data),

  changePin: (body: { currentPin: string; newPin: string }) =>
    api.post<{ success: boolean }>("/auth/change-pin", body).then((r) => r.data),

  submitRecovery: (body: {
    identifier: string;
    channel: "email" | "phone" | "alternative";
  }) =>
    api.post<RecoverySubmitResponse>("/auth/superadmin/forgot-access", body).then((r) => r.data),
};
