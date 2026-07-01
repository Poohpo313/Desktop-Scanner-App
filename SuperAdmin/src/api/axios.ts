import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<{ accessToken: string; role: string; userId: number }>("/auth/refresh")
      .then((response) => {
        const { accessToken, role, userId } = response.data;
        useAuthStore.getState().setSession({
          accessToken,
          role: role as "superadmin",
          userId,
        });
        return accessToken;
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          const hasToken = Boolean(useAuthStore.getState().accessToken);
          if (!hasToken) {
            useAuthStore.getState().clearSession();
          }
        }
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

const AUTH_LOGIN_PATHS = [
  "/auth/superadmin/login",
  "/auth/admin/login",
  "/auth/user/login",
  "/auth/user/activate",
];

function isAuthLoginRequest(url?: string) {
  if (!url) return false;
  return AUTH_LOGIN_PATHS.some((path) => url.includes(path));
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthLoginRequest(original.url)
    ) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }

      if (!window.location.pathname.includes("/portal/login")) {
        window.location.href = "/portal/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
