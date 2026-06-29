import type { AxiosError } from "axios";

function messageFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const message = (payload as { message?: string | string[] }).message;
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string" && message.trim()) return message.trim();

  return null;
}

export function extractApiError(error: unknown, fallback = "Request failed"): string {
  if (typeof error === "string" && error.trim()) return error.trim();

  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const fromResponse = messageFromPayload(axiosError.response?.data);
  if (fromResponse) return fromResponse;

  if (axiosError.message) return axiosError.message;

  return fallback;
}
