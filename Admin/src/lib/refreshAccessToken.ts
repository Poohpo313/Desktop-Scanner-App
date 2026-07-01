import axios, { type AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types";

export type RefreshAccessTokenResult = {
  token: string | null;
  unauthorized: boolean;
};

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  withCredentials: true,
});

let refreshPromise: Promise<RefreshAccessTokenResult> | null = null;

export async function refreshAccessToken(): Promise<RefreshAccessTokenResult> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ accessToken: string; role: string; userId: number }>("/auth/refresh")
      .then((response) => {
        const { accessToken, role, userId } = response.data;
        useAuthStore.getState().setSession({
          accessToken,
          role: role as UserRole,
          userId,
        });
        return { token: accessToken, unauthorized: false };
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          const hasToken = Boolean(useAuthStore.getState().accessToken);
          if (!hasToken) {
            useAuthStore.getState().clearSession();
          }
          return { token: null, unauthorized: !hasToken };
        }
        return { token: null, unauthorized: false };
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
