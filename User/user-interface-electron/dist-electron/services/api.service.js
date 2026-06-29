"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONLINE_ACTIVATION_TIMEOUT_MS = void 0;
exports.getOnlineApiUrl = getOnlineApiUrl;
exports.setOnlineAccessToken = setOnlineAccessToken;
exports.getOnlineAccessToken = getOnlineAccessToken;
exports.refreshOnlineAccessToken = refreshOnlineAccessToken;
exports.ensureOnlineAuthenticated = ensureOnlineAuthenticated;
exports.updateUserProfileOnline = updateUserProfileOnline;
exports.changeUserPasswordOnline = changeUserPasswordOnline;
exports.fetchUserSupportContactOnline = fetchUserSupportContactOnline;
exports.fetchPublicSupportContactOnline = fetchPublicSupportContactOnline;
exports.isOnlineAvailable = isOnlineAvailable;
exports.loginOnline = loginOnline;
exports.activateUserAccountOnline = activateUserAccountOnline;
exports.syncUserAccountOnline = syncUserAccountOnline;
exports.submitUserConcern = submitUserConcern;
exports.listUserConcerns = listUserConcerns;
exports.markUserConcernReplyRead = markUserConcernReplyRead;
exports.registerDeviceOnline = registerDeviceOnline;
exports.heartbeatDevice = heartbeatDevice;
exports.disconnectDeviceOnline = disconnectDeviceOnline;
exports.uploadDocumentsBatch = uploadDocumentsBatch;
exports.fetchMyKeyStatusOnline = fetchMyKeyStatusOnline;
exports.requestKeyExtensionOnline = requestKeyExtensionOnline;
exports.requestKeyRenewalOnline = requestKeyRenewalOnline;
exports.submitUserRecovery = submitUserRecovery;
/**
 * HTTP client for the online PostgreSQL API (gateway).
 * Not related to the planned cloud storage / Google Bucket integration.
 */
const gateway_config_service_1 = require("./gateway-config.service");
const gateway_discovery_service_1 = require("./gateway-discovery.service");
const online_auth_store_1 = require("./online-auth-store");
const ONLINE_REQUEST_TIMEOUT_MS = 8_000;
exports.ONLINE_ACTIVATION_TIMEOUT_MS = 1_500;
let accessToken = null;
async function fetchOnline(input, init, timeoutMs = ONLINE_REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("Could not reach the online API");
        }
        throw error;
    }
    finally {
        clearTimeout(timeout);
    }
}
function getOnlineApiUrl() {
    return (0, gateway_config_service_1.getGatewayApiUrl)();
}
function setOnlineAccessToken(token) {
    accessToken = token;
}
function getOnlineAccessToken() {
    return accessToken;
}
async function refreshOnlineAccessToken() {
    try {
        const res = await fetchOnline(`${getOnlineApiUrl()}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) {
            return { success: false };
        }
        const data = (await res.json());
        accessToken = data.accessToken;
        return { success: true, accessToken: data.accessToken };
    }
    catch {
        return { success: false };
    }
}
async function ensureOnlineAuthenticated(userId) {
    if (!accessToken && userId != null) {
        const stored = (0, online_auth_store_1.loadOnlineAuth)(userId);
        if (stored?.accessToken) {
            accessToken = stored.accessToken;
        }
    }
    if (accessToken) {
        return { success: true, accessToken };
    }
    const refreshed = await refreshOnlineAccessToken();
    if (refreshed.success) {
        return refreshed;
    }
    if (userId != null) {
        const stored = (0, online_auth_store_1.loadOnlineAuth)(userId);
        if (stored?.accessToken) {
            accessToken = stored.accessToken;
            return { success: true, accessToken: stored.accessToken };
        }
    }
    return {
        success: false,
        error: "Not authenticated with the online API",
    };
}
function parseApiErrorMessage(text, fallback) {
    const trimmed = text.trim();
    if (!trimmed)
        return fallback;
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed.message) {
            if (parsed.statusCode === 401) {
                return "Your session expired. Sign out, connect to the internet, and sign in again to view tickets.";
            }
            return parsed.message;
        }
    }
    catch {
        /* use raw text */
    }
    return trimmed;
}
async function updateUserProfileOnline(payload) {
    const auth = await ensureOnlineAuthenticated();
    if (!auth.success) {
        return { success: false, error: auth.error };
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
            return { success: false, error: text || "Could not sync profile" };
        }
        return { success: true, data: await res.json() };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function changeUserPasswordOnline(currentPassword, newPassword) {
    const auth = await ensureOnlineAuthenticated();
    if (!auth.success) {
        return { success: false, error: auth.error };
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
            return { success: false, error: text || "Could not sync password" };
        }
        return { success: true };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function fetchUserSupportContactOnline() {
    const auth = await ensureOnlineAuthenticated();
    if (!auth.success) {
        return { success: false, error: auth.error ?? "Not authenticated with the online API" };
    }
    try {
        const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/support-contact`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
            const text = await res.text();
            return { success: false, error: text || "Could not load support contact" };
        }
        return {
            success: true,
            contact: (await res.json()),
        };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function fetchPublicSupportContactOnline(params) {
    const username = params.username?.trim();
    const serialKey = params.serialKey?.trim();
    if (!username && !serialKey) {
        return { success: false, error: "Username or serial key required" };
    }
    const query = new URLSearchParams();
    if (username)
        query.set("username", username);
    if (serialKey)
        query.set("serialKey", serialKey);
    try {
        const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/public-support-contact?${query}`, {
            method: "GET",
        });
        if (!res.ok) {
            const text = await res.text();
            return { success: false, error: text || "Could not load support contact" };
        }
        return {
            success: true,
            contact: (await res.json()),
        };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function isOnlineAvailable(apiUrl) {
    const target = apiUrl ?? (0, gateway_config_service_1.getGatewayApiUrl)();
    if (await (0, gateway_discovery_service_1.probeGatewayHealth)(target)) {
        return true;
    }
    try {
        const res = await fetchOnline(`${target.replace(/\/+$/, "")}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        return res.ok || res.status === 401;
    }
    catch {
        return false;
    }
}
async function loginOnline(username, password) {
    try {
        const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            const text = await res.text();
            return { success: false, error: text || "Online login failed" };
        }
        const data = (await res.json());
        accessToken = data.accessToken;
        return { success: true, accessToken: data.accessToken };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function activateUserAccountOnline(payload) {
    try {
        const res = await fetchOnline(`${getOnlineApiUrl()}/auth/user/activate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }, exports.ONLINE_ACTIVATION_TIMEOUT_MS);
        if (!res.ok) {
            const text = await res.text();
            let message = text || "Activation failed";
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed.message))
                    message = parsed.message.join(" ");
                else if (parsed.message)
                    message = parsed.message;
            }
            catch {
                /* keep raw text */
            }
            return { success: false, error: message };
        }
        return { success: true, data: await res.json() };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function syncUserAccountOnline(username, password) {
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
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed.message))
                    message = parsed.message.join(" ");
                else if (parsed.message)
                    message = parsed.message;
            }
            catch {
                /* keep raw text */
            }
            return { success: false, error: message };
        }
        return { success: true, data: await res.json() };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function submitUserConcern(payload) {
    const auth = await ensureOnlineAuthenticated();
    if (!auth.success) {
        return { success: false, error: auth.error };
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
            return { success: false, error: text || "Could not submit concern" };
        }
        return { success: true, data: await res.json() };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function listUserConcerns(userId) {
    const auth = await ensureOnlineAuthenticated(userId);
    if (!auth.success) {
        return {
            success: false,
            error: auth.error,
            data: [],
        };
    }
    try {
        const res = await fetchOnline(`${getOnlineApiUrl()}/user-concerns/mine`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
            const text = await res.text();
            return {
                success: false,
                error: parseApiErrorMessage(text, "Could not load tickets"),
                data: [],
            };
        }
        return { success: true, data: (await res.json()) };
    }
    catch {
        return { success: false, error: "Could not reach the online API", data: [] };
    }
}
async function markUserConcernReplyRead(concernId) {
    const auth = await ensureOnlineAuthenticated();
    if (!auth.success) {
        return { success: false, error: auth.error };
    }
    try {
        const res = await fetch(`${getOnlineApiUrl()}/user-concerns/${concernId}/read-reply`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
            const text = await res.text();
            return { success: false, error: text || "Could not update ticket" };
        }
        return { success: true };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function registerDeviceOnline(payload) {
    try {
        const res = await fetchOnline(`${getOnlineApiUrl()}/devices/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const text = await res.text();
            return { success: false, error: text || "Device registration failed" };
        }
        return { success: true, data: await res.json() };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Could not reach the online API";
        return { success: false, error: message };
    }
}
async function heartbeatDevice(serialNumber, userId) {
    try {
        await fetch(`${getOnlineApiUrl()}/devices/heartbeat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serialNumber, userId })
        });
    }
    catch {
        // Offline — ignore
    }
}
async function disconnectDeviceOnline(serialNumber) {
    try {
        await fetch(`${getOnlineApiUrl()}/devices/disconnect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serialNumber })
        });
    }
    catch {
        // Offline — ignore
    }
}
async function uploadDocumentsBatch(documents) {
    if (!accessToken) {
        return { success: false, error: "Not authenticated with online API" };
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
        return { success: false, error: text || "Sync upload failed" };
    }
    return { success: true, data: await res.json() };
}
async function fetchMyKeyStatusOnline(userId) {
    const auth = await ensureOnlineAuthenticated(userId);
    if (!auth.success) {
        return { success: false, error: auth.error ?? "Not authenticated with the online API" };
    }
    try {
        const res = await fetchOnline(`${getOnlineApiUrl()}/keys/my-key/status`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
            const text = await res.text();
            return { success: false, error: parseApiErrorMessage(text, "Could not load key status") };
        }
        return { success: true, data: await res.json() };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function requestKeyExtensionOnline(requestedDays, userNote, userId) {
    const auth = await ensureOnlineAuthenticated(userId);
    if (!auth.success) {
        return { success: false, error: auth.error ?? "Not authenticated with the online API" };
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
            return { success: false, error: parseApiErrorMessage(text, "Could not submit request") };
        }
        return { success: true, data: await res.json() };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function requestKeyRenewalOnline(requestedDays, userNote, userId) {
    const auth = await ensureOnlineAuthenticated(userId);
    if (!auth.success) {
        return { success: false, error: auth.error ?? "Not authenticated with the online API" };
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
            return { success: false, error: parseApiErrorMessage(text, "Could not submit request") };
        }
        return { success: true, data: await res.json() };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
async function submitUserRecovery(payload) {
    try {
        const res = await fetch(`${getOnlineApiUrl()}/auth/user/forgot-credentials`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const text = await res.text();
            return { success: false, error: text || "Recovery request failed" };
        }
        return { success: true, data: await res.json() };
    }
    catch {
        return { success: false, error: "Could not reach the online API" };
    }
}
