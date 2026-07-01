import { getGatewayApiUrl } from "./gateway-config.service";
import { probeGatewayHealth } from "./gateway-discovery.service";
import { loadOnlineAuth, saveOnlineAuth } from "./online-auth-store";
const ONLINE_REQUEST_TIMEOUT_MS = 8_000;
export const ONLINE_ACTIVATION_TIMEOUT_MS = 1_500;

let accessToken: string | null = null;

async function fetchOnline(
  input: string,
  init?: RequestInit,
  timeoutMs = ONLINE_REQUEST_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Could not reach the online API");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function getOnlineApiUrl() {
  return getGatewayApiUrl();
}

export function setOnlineAccessToken(token: string | null) {
  accessToken = token;
}

export function getOnlineAccessToken() {
  return accessToken;
}

export async function refreshOnlineAccessToken() {
  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      return { success: false as const };
    }

    const data = (await res.json()) as { accessToken: string };
    accessToken = data.accessToken;
    return { success: true as const, accessToken: data.accessToken };
  } catch {
    return { success: false as const };
  }
}

export async function ensureOnlineAuthenticated(userId?: number) {
  if (!accessToken && userId != null) {
    const stored = loadOnlineAuth(userId);
    if (stored?.accessToken) {
      accessToken = stored.accessToken;
    }
  }

  if (accessToken) {
    return { success: true as const, accessToken };
  }

  const refreshed = await refreshOnlineAccessToken();
  if (refreshed.success) {
    return refreshed;
  }

  if (userId != null) {
    const stored = loadOnlineAuth(userId);
    if (stored?.accessToken) {
      accessToken = stored.accessToken;
      return { success: true as const, accessToken: stored.accessToken };
    }
  }

  return {
    success: false as const,
    error: "Not authenticated with the online API",
  };
}

function parseApiErrorMessage(text: string, fallback: string): string {
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  try {
    const parsed = JSON.parse(trimmed) as { message?: string; statusCode?: number };
    if (parsed.message) {
      if (parsed.statusCode === 401) {
        return "Your session expired. Sign out, connect to the internet, and sign in again to view tickets.";
      }
      return parsed.message;
    }
  } catch {
    /* use raw text */
  }
  return trimmed;
}

export type SupportContactInfo = {
  adminName: string | null;
  email: string | null;
  phoneNumber: string | null;
  company?: string | null;
  department?: string | null;
};

export async function updateUserProfileOnline(payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}) {
  const auth = await ensureOnlineAuthenticated();
  if (!auth.success) {
    return { success: false as const, error: auth.error };
  }

  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Could not sync profile" };
    }

    return { success: true as const, data: await res.json() };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function changeUserPasswordOnline(currentPassword: string, newPassword: string) {
  const auth = await ensureOnlineAuthenticated();
  if (!auth.success) {
    return { success: false as const, error: auth.error };
  }

  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Could not sync password" };
    }

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function fetchUserSupportContactOnline() {
  const auth = await ensureOnlineAuthenticated();
  if (!auth.success) {
    return { success: false as const, error: auth.error ?? "Not authenticated with the online API" };
  }

  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/support-contact`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Could not load support contact" };
    }

    return {
      success: true as const,
      contact: (await res.json()) as SupportContactInfo,
    };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function fetchPublicSupportContactOnline(params: {
  username?: string;
  serialKey?: string;
} = {}) {
  const username = params.username?.trim();
  const serialKey = params.serialKey?.trim();

  const query = new URLSearchParams();
  if (username) query.set("username", username);
  if (serialKey) query.set("serialKey", serialKey);
  const querySuffix = query.toString();

  try {
    const res = await fetchOnline(
      `${getOnlineApiUrl()}/auth/user/public-support-contact${querySuffix ? `?${querySuffix}` : ""}`,
      {
        method: "GET",
      },
    );

    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Could not load support contact" };
    }

    return {
      success: true as const,
      contact: (await res.json()) as SupportContactInfo,
    };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function isOnlineAvailable(apiUrl?: string): Promise<boolean> {
  const target = apiUrl ?? getGatewayApiUrl();
  if (await probeGatewayHealth(target)) {
    return true;
  }

  try {
    const res = await fetchOnline(`${target.replace(/\/+$/, "")}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok || res.status === 401;
  } catch {
    return false;
  }
}

export async function loginOnline(username: string, password: string) {
  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Online login failed" };
    }

    const data = (await res.json()) as { accessToken: string };
    accessToken = data.accessToken;
    return { success: true as const, accessToken: data.accessToken };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export type OnlineActivationPayload = {
  userId: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  company?: string | null;
  accountStatus: string;
  serialKey?: string | null;
  serialKeyStatus?: string | null;
  passwordHash?: string;
  accessToken?: string;
  adminContact?: {
    adminName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
};

export async function activateUserAccountOnline(payload: {
  serialKey: string;
  username: string;
}) {
  try {
    const res = await fetchOnline(
      `${getOnlineApiUrl()}/auth/user/activate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      },
      ONLINE_ACTIVATION_TIMEOUT_MS,
    );

    if (!res.ok) {
      const text = await res.text();
      let message = text || "Activation failed";
      try {
        const parsed = JSON.parse(text) as { message?: string | string[] };
        if (Array.isArray(parsed.message)) message = parsed.message.join(" ");
        else if (parsed.message) message = parsed.message;
      } catch {
        /* keep raw text */
      }
      return { success: false as const, error: message };
    }

    const data = (await res.json()) as OnlineActivationPayload;
    if (data.accessToken) {
      accessToken = data.accessToken;
    }
    return { success: true as const, data };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function syncUserAccountOnline(username: string, password: string) {
  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/sync-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = text || "Account sync failed";
      try {
        const parsed = JSON.parse(text) as { message?: string | string[] };
        if (Array.isArray(parsed.message)) message = parsed.message.join(" ");
        else if (parsed.message) message = parsed.message;
      } catch {
        /* keep raw text */
      }
      return { success: false as const, error: message };
    }

    return { success: true as const, data: await res.json() };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function submitUserConcern(payload: {
  concernType: string;
  category: string;
  subject: string;
  message: string;
  email?: string;
  rating?: number;
}) {
  const auth = await ensureOnlineAuthenticated();
  if (!auth.success) {
    return { success: false as const, error: auth.error };
  }

  try {
    const res = await fetch(`${getOnlineApiUrl()}/user-concerns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Could not submit concern" };
    }

    return { success: true as const, data: await res.json() };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export type UserConcernTicket = {
  id: number;
  subject: string;
  category: string;
  concernType: string;
  message: string;
  status: string;
  timestamp: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  replyRead?: boolean;
};

export async function listUserConcerns(userId?: number) {
  const auth = await ensureOnlineAuthenticated(userId);
  if (!auth.success) {
    return {
      success: false as const,
      error: auth.error,
      data: [] as UserConcernTicket[],
    };
  }

  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/user-concerns/mine`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false as const,
        error: parseApiErrorMessage(text, "Could not load tickets"),
        data: [] as UserConcernTicket[],
      };
    }

    return { success: true as const, data: (await res.json()) as UserConcernTicket[] };
  } catch {
    return { success: false as const, error: "Could not reach the online API", data: [] as UserConcernTicket[] };
  }
}

export async function markUserConcernReplyRead(concernId: number) {
  const auth = await ensureOnlineAuthenticated();
  if (!auth.success) {
    return { success: false as const, error: auth.error };
  }

  try {
    const res = await fetch(`${getOnlineApiUrl()}/user-concerns/${concernId}/read-reply`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Could not update ticket" };
    }

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function registerDeviceOnline(payload: {
  deviceName: string;
  deviceType: string;
  serialNumber: string;
  assignedUser: number;
  username?: string;
}) {
  try {
    const auth = await ensureOnlineAuthenticated(payload.assignedUser);
    if (!auth.success) {
      return { success: false as const, error: auth.error ?? "Not authenticated with the online API" };
    }

    const res = await fetchOnline(`${getOnlineApiUrl()}/devices/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      const refreshed = await refreshOnlineAccessToken();
      if (refreshed.success) {
        saveOnlineAuth(payload.assignedUser, refreshed.accessToken);
        const retry = await fetchOnline(`${getOnlineApiUrl()}/devices/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshed.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
        if (!retry.ok) {
          const text = await retry.text();
          return { success: false as const, error: text || "Device registration failed" };
        }
        return { success: true as const, data: await retry.json() };
      }
    }
    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Device registration failed" };
    }
    return { success: true as const, data: await res.json() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach the online API";
    return { success: false as const, error: message };
  }
}

export async function heartbeatDevice(serialNumber: string, userId?: number) {
  try {
    if (userId == null) return { success: false as const };
    const auth = await ensureOnlineAuthenticated(userId);
    if (!auth.success || !accessToken) return { success: false as const };

    const send = () =>
      fetchOnline(`${getOnlineApiUrl()}/devices/heartbeat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ serialNumber, userId }),
      });

    let res = await send();
    if (res.status === 401) {
      const refreshed = await refreshOnlineAccessToken();
      if (refreshed.success) {
        saveOnlineAuth(userId, refreshed.accessToken);
        res = await send();
      }
    }

    if (res.status === 404) {
      return { success: false as const, needsRegister: true as const };
    }
    if (!res.ok) return { success: false as const };
    return { success: true as const };
  } catch {
    return { success: false as const };
  }
}

export async function disconnectDeviceOnline(serialNumber: string, userId?: number) {
  try {
    if (userId == null) return;
    const auth = await ensureOnlineAuthenticated(userId);
    if (!auth.success || !accessToken) return;

    await fetchOnline(`${getOnlineApiUrl()}/devices/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ serialNumber }),
    });
  } catch {
    // Offline — ignore
  }
}

export type SyncDocumentPayload = {
  filename: string;
  mimeType?: string;
  fileSize?: number;
  fileHash: string;
  ocrText?: string;
  contentBase64?: string;
  deviceId?: number;
};

export async function uploadDocumentsBatch(documents: SyncDocumentPayload[]) {
  if (!accessToken) {
    return { success: false as const, error: "Not authenticated with online API" };
  }

  const res = await fetch(`${getOnlineApiUrl()}/sync/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(documents)
  });

  if (!res.ok) {
    const text = await res.text();
    return { success: false as const, error: text || "Sync upload failed" };
  }

  return { success: true as const, data: await res.json() };
}

export async function fetchMyKeyStatusOnline(userId?: number) {
  const auth = await ensureOnlineAuthenticated(userId);
  if (!auth.success) {
    return { success: false as const, error: auth.error ?? "Not authenticated with the online API" };
  }

  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/keys/my-key/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: parseApiErrorMessage(text, "Could not load key status") };
    }
    return { success: true as const, data: await res.json() };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function requestKeyExtensionOnline(requestedDays: number, userNote?: string, userId?: number) {
  const auth = await ensureOnlineAuthenticated(userId);
  if (!auth.success) {
    return { success: false as const, error: auth.error ?? "Not authenticated with the online API" };
  }

  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/keys/my-key/request-extension`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ requestedDays, userNote }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: parseApiErrorMessage(text, "Could not submit request") };
    }
    return { success: true as const, data: await res.json() };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function requestKeyRenewalOnline(requestedDays: number, userNote?: string, userId?: number) {
  const auth = await ensureOnlineAuthenticated(userId);
  if (!auth.success) {
    return { success: false as const, error: auth.error ?? "Not authenticated with the online API" };
  }

  try {
    const res = await fetchOnline(`${getOnlineApiUrl()}/keys/my-key/request-renewal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ requestedDays, userNote }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: parseApiErrorMessage(text, "Could not submit request") };
    }
    return { success: true as const, data: await res.json() };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}

export async function submitUserRecovery(payload: {
  channel: "email" | "sms";
  username?: string;
  context?: string;
}) {
  try {
    const res = await fetch(`${getOnlineApiUrl()}/auth/user/forgot-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: text || "Recovery request failed" };
    }

    return { success: true as const, data: await res.json() };
  } catch {
    return { success: false as const, error: "Could not reach the online API" };
  }
}
