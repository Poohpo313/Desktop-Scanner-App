"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const crypto_1 = require("crypto");
const db_service_1 = require("./db.service");
const device_service_1 = require("./device.service");
const device_presence_service_1 = require("./device-presence.service");
const hash_service_1 = require("./hash.service");
const keys_service_1 = require("./keys.service");
const gateway_config_service_1 = require("./gateway-config.service");
const gateway_discovery_service_1 = require("./gateway-discovery.service");
const api_service_1 = require("./api.service");
const online_auth_store_1 = require("./online-auth-store");
const session_store_1 = require("./session-store");
const pending_activation_store_1 = require("./pending-activation-store");
const NOT_ACTIVATED_ERROR = "Account not Activated : Activate account first to access";
const sessions = new Map();
const failedAttempts = new Map();
const USER_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
function persistSessions() {
    (0, session_store_1.saveStoredSessions)([...sessions.values()]);
}
function rememberSession(session) {
    sessions.set(session.token, session);
    persistSessions();
}
function forgetSession(token) {
    sessions.delete(token);
    persistSessions();
}
function purgeExpiredSessions() {
    const now = Date.now();
    let changed = false;
    for (const [token, session] of sessions) {
        if (session.expiresAt <= now) {
            sessions.delete(token);
            changed = true;
        }
    }
    if (changed)
        persistSessions();
}
function rememberOnlineAuth(userId, token) {
    (0, api_service_1.setOnlineAccessToken)(token);
    (0, online_auth_store_1.saveOnlineAuth)(userId, token);
}
function rememberSupportContact(userId, username, contact) {
    if (!contact)
        return;
    (0, online_auth_store_1.saveSupportContact)(userId, {
        username,
        adminName: contact.adminName ?? null,
        email: contact.email ?? null,
        phoneNumber: contact.phoneNumber ?? null,
    });
}
async function authenticateOnline(userId, username, password) {
    const onlineLogin = await (0, api_service_1.loginOnline)(username, password);
    if (onlineLogin.success) {
        rememberOnlineAuth(userId, onlineLogin.accessToken);
        return true;
    }
    const stored = (0, online_auth_store_1.loadOnlineAuth)(userId);
    if (stored?.accessToken) {
        (0, api_service_1.setOnlineAccessToken)(stored.accessToken);
        return true;
    }
    return false;
}
function sanitizeUserContactFields(email, phoneNumber, adminContact) {
    let nextEmail = email?.trim() || null;
    let nextPhone = phoneNumber?.trim() || null;
    const adminEmail = adminContact?.email?.trim().toLowerCase();
    const adminPhone = adminContact?.phoneNumber?.replace(/\D/g, "") ?? "";
    if (adminEmail && nextEmail?.toLowerCase() === adminEmail) {
        nextEmail = null;
    }
    if (adminPhone && nextPhone?.replace(/\D/g, "") === adminPhone) {
        nextPhone = null;
    }
    return { email: nextEmail, phoneNumber: nextPhone };
}
function restoreOnlineAuthForSessions() {
    const activeSessions = [...sessions.values()].filter((session) => session.expiresAt > Date.now());
    if (activeSessions.length === 0)
        return;
    const latest = activeSessions.sort((a, b) => b.expiresAt - a.expiresAt)[0];
    const stored = (0, online_auth_store_1.loadOnlineAuth)(latest.userId);
    if (stored?.accessToken) {
        (0, api_service_1.setOnlineAccessToken)(stored.accessToken);
    }
}
const emptyAccountContext = () => ({
    adminContact: { adminName: null, email: null, phoneNumber: null },
    company: null,
    department: null,
});
function hasAdminContact(context) {
    const { adminContact } = context;
    return Boolean(adminContact.adminName?.trim() ||
        adminContact.email?.trim() ||
        adminContact.phoneNumber?.trim());
}
function mergeAccountContext(base, incoming) {
    return {
        adminContact: {
            adminName: incoming.adminContact?.adminName?.trim() ||
                base.adminContact.adminName?.trim() ||
                null,
            email: incoming.adminContact?.email?.trim() || base.adminContact.email?.trim() || null,
            phoneNumber: incoming.adminContact?.phoneNumber?.trim() ||
                base.adminContact.phoneNumber?.trim() ||
                null,
        },
        company: incoming.company?.trim() || base.company?.trim() || null,
        department: incoming.department?.trim() || base.department?.trim() || null,
    };
}
async function loadLocalAccountContext(userId) {
    const row = await (0, db_service_1.queryOne)(`SELECT
       u.admin_contact_name,
       u.admin_contact_email,
       u.admin_contact_phone,
       u.company,
       u.department,
       u.serial_key,
       (
         SELECT sk.company
         FROM serial_keys sk
         WHERE sk.assigned_to = u.user_id
            OR LOWER(sk.serial_key) = LOWER(COALESCE(u.serial_key, ''))
         ORDER BY sk.serial_id DESC
         LIMIT 1
       ) AS key_company,
       (
         SELECT sk.department
         FROM serial_keys sk
         WHERE sk.assigned_to = u.user_id
            OR LOWER(sk.serial_key) = LOWER(COALESCE(u.serial_key, ''))
         ORDER BY sk.serial_id DESC
         LIMIT 1
       ) AS key_department
     FROM users u
     WHERE u.user_id = $1`, [userId]);
    if (!row)
        return emptyAccountContext();
    return {
        adminContact: {
            adminName: row.admin_contact_name?.trim() || null,
            email: row.admin_contact_email?.trim() || null,
            phoneNumber: row.admin_contact_phone?.trim() || null,
        },
        company: row.company?.trim() || row.key_company?.trim() || null,
        department: row.department?.trim() || row.key_department?.trim() || null,
    };
}
async function persistAccountContextToUser(userId, context) {
    const { adminContact, company, department } = context;
    await (0, db_service_1.query)(`UPDATE users
     SET admin_contact_name = COALESCE($1, admin_contact_name),
         admin_contact_email = COALESCE($2, admin_contact_email),
         admin_contact_phone = COALESCE($3, admin_contact_phone),
         company = COALESCE($4, company),
         department = COALESCE($5, department),
         updated_at = NOW()
     WHERE user_id = $6`, [
        adminContact.adminName?.trim() || null,
        adminContact.email?.trim() || null,
        adminContact.phoneNumber?.trim() || null,
        company?.trim() || null,
        department?.trim() || null,
        userId,
    ]);
}
async function resolveAccountContext(userId, username) {
    let context = await loadLocalAccountContext(userId);
    const online = await (0, api_service_1.fetchUserSupportContactOnline)();
    if (online.success && online.contact) {
        context = mergeAccountContext(context, {
            adminContact: {
                adminName: online.contact.adminName ?? null,
                email: online.contact.email ?? null,
                phoneNumber: online.contact.phoneNumber ?? null,
            },
            company: online.contact.company ?? null,
            department: online.contact.department ?? null,
        });
        if (hasAdminContact(context)) {
            rememberSupportContact(userId, username, context.adminContact);
        }
        await persistAccountContextToUser(userId, context);
        return context;
    }
    const cached = (0, online_auth_store_1.loadSupportContact)(userId, username);
    if (cached && !hasAdminContact(context)) {
        context = mergeAccountContext(context, {
            adminContact: {
                adminName: cached.adminName,
                email: cached.email,
                phoneNumber: cached.phoneNumber,
            },
        });
    }
    if (hasAdminContact(context) || context.company || context.department) {
        await persistAccountContextToUser(userId, context);
    }
    return context;
}
async function realignOfflineUserId(fromId, toId) {
    if (fromId === toId)
        return;
    await (0, db_service_1.query)(`UPDATE devices SET assigned_user = $1 WHERE assigned_user = $2`, [toId, fromId]);
    await (0, db_service_1.query)(`UPDATE serial_keys SET assigned_to = $1 WHERE assigned_to = $2`, [toId, fromId]);
    await (0, db_service_1.query)(`UPDATE documents SET uploaded_by = $1 WHERE uploaded_by = $2`, [toId, fromId]);
    await (0, db_service_1.query)(`UPDATE scan_history SET scanned_by = $1 WHERE scanned_by = $2`, [toId, fromId]);
    await (0, db_service_1.query)(`UPDATE folders SET created_by = $1 WHERE created_by = $2`, [toId, fromId]);
    await (0, db_service_1.query)(`UPDATE activity_logs SET user_id = $1 WHERE user_id = $2`, [toId, fromId]);
    await (0, db_service_1.query)(`UPDATE users SET user_id = $1 WHERE user_id = $2`, [toId, fromId]);
}
async function upsertOfflineUser(account, password = "", passwordHash) {
    let hash = passwordHash ??
        (password ? await hash_service_1.hashService.hashPassword(password) : null);
    if (!hash) {
        const existing = await (0, db_service_1.queryOne)("SELECT password_hash FROM users WHERE LOWER(username) = LOWER($1)", [account.username]);
        hash = existing?.password_hash ?? null;
    }
    if (!hash) {
        throw new Error("Missing password hash for offline account sync");
    }
    const existing = await (0, db_service_1.queryOne)("SELECT user_id FROM users WHERE LOWER(username) = LOWER($1)", [account.username]);
    if (existing) {
        if (existing.user_id !== account.userId) {
            const targetExists = await (0, db_service_1.queryOne)("SELECT user_id FROM users WHERE user_id = $1", [account.userId]);
            if (!targetExists) {
                await realignOfflineUserId(existing.user_id, account.userId);
                existing.user_id = account.userId;
            }
        }
        const sanitized = sanitizeUserContactFields(account.email, account.phoneNumber, account.adminContact);
        const adminContactName = account.adminContact?.adminName?.trim() || null;
        const adminContactEmail = account.adminContact?.email?.trim() || null;
        const adminContactPhone = account.adminContact?.phoneNumber?.trim() || null;
        await (0, db_service_1.query)(`UPDATE users
       SET password_hash = $1,
           first_name = $2,
           last_name = $3,
           email = $4,
           phone_number = $5,
           account_status = $6,
           serial_key = $7,
           company = $8,
           department = $9,
           admin_contact_name = $10,
           admin_contact_email = $11,
           admin_contact_phone = $12,
           contact_saved_by_user = CASE
             WHEN $13 OR $14 THEN true
             ELSE contact_saved_by_user
           END,
           updated_at = NOW()
       WHERE user_id = $15`, [
            hash,
            account.firstName ?? null,
            account.lastName ?? null,
            sanitized.email,
            sanitized.phoneNumber,
            account.accountStatus,
            account.serialKey ?? null,
            account.company ?? null,
            account.department ?? null,
            adminContactName,
            adminContactEmail,
            adminContactPhone,
            Boolean(sanitized.email),
            Boolean(sanitized.phoneNumber),
            existing.user_id,
        ]);
        return existing.user_id;
    }
    const sanitized = sanitizeUserContactFields(account.email, account.phoneNumber, account.adminContact);
    const adminContactName = account.adminContact?.adminName?.trim() || null;
    const adminContactEmail = account.adminContact?.email?.trim() || null;
    const adminContactPhone = account.adminContact?.phoneNumber?.trim() || null;
    const rows = await (0, db_service_1.query)(`INSERT INTO users (
       user_id, username, password_hash, first_name, last_name, email, phone_number,
       account_status, role_id, serial_key, company, department,
       admin_contact_name, admin_contact_email, admin_contact_phone, contact_saved_by_user
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, $10, $11, $12, $13, $14, $15)
     RETURNING user_id`, [
        account.userId,
        account.username,
        hash,
        account.firstName ?? null,
        account.lastName ?? null,
        sanitized.email,
        sanitized.phoneNumber,
        account.accountStatus,
        account.serialKey ?? null,
        account.company ?? null,
        account.department ?? null,
        adminContactName,
        adminContactEmail,
        adminContactPhone,
        Boolean(sanitized.email || sanitized.phoneNumber),
    ]);
    return rows[0]?.user_id ?? account.userId;
}
async function upsertOfflineSerialKey(serialKey, userId, status, meta) {
    const existing = await (0, db_service_1.queryOne)("SELECT serial_id FROM serial_keys WHERE LOWER(serial_key) = LOWER($1)", [
        serialKey.trim(),
    ]);
    const company = meta?.company?.trim() || null;
    const department = meta?.department?.trim() || null;
    if (existing) {
        await (0, db_service_1.query)(`UPDATE serial_keys
       SET status = $1,
           assigned_to = $2,
           company = COALESCE($4, company),
           department = COALESCE($5, department),
           used_at = CASE WHEN $6 THEN NOW() ELSE used_at END
       WHERE LOWER(serial_key) = LOWER($3)`, [status, userId, serialKey.trim(), company, department, status === "used"]);
        return;
    }
    await (0, db_service_1.query)(`INSERT INTO serial_keys (serial_key, assigned_to, status, company, department, used_at)
     VALUES ($1, $2, $3, $4, $5, $6)`, [serialKey.trim(), userId, status, company, department, status === "used" ? new Date() : null]);
}
function extractApiMessage(error) {
    try {
        const parsed = JSON.parse(error);
        if (Array.isArray(parsed.message))
            return parsed.message.join(" ");
        if (parsed.message)
            return parsed.message;
    }
    catch {
        /* keep raw text */
    }
    return error;
}
function isNotActivatedMessage(message) {
    return message.includes("Account not Activated");
}
async function syncUserFromOnline(username, password) {
    const result = await (0, api_service_1.syncUserAccountOnline)(username, password);
    if (!result.success || !result.data) {
        const message = extractApiMessage(result.error ?? "");
        if (isNotActivatedMessage(message)) {
            return { success: false, error: NOT_ACTIVATED_ERROR };
        }
        return { success: false, error: result.error };
    }
    const userId = await upsertOfflineUser(result.data, password);
    if (result.data.serialKey) {
        await upsertOfflineSerialKey(result.data.serialKey, userId, result.data.serialKeyStatus === "used" ? "used" : "assigned", { company: result.data.company, department: result.data.department });
    }
    rememberSupportContact(userId, result.data.username, result.data.adminContact);
    if (result.data.adminContact || result.data.company || result.data.department) {
        await persistAccountContextToUser(userId, {
            adminContact: {
                adminName: result.data.adminContact?.adminName ?? null,
                email: result.data.adminContact?.email ?? null,
                phoneNumber: result.data.adminContact?.phoneNumber ?? null,
            },
            company: result.data.company ?? null,
            department: result.data.department ?? null,
        });
    }
    return { success: true, data: result.data };
}
function createUserSession(userId) {
    const token = (0, crypto_1.randomUUID)();
    const session = {
        token,
        userId,
        role: "user",
        expiresAt: Date.now() + USER_SESSION_MS,
    };
    rememberSession(session);
    return token;
}
function isOnlineUnavailableMessage(message) {
    return (message === "Could not reach the online API" ||
        message.toLowerCase().includes("fetch failed") ||
        message.toLowerCase().includes("network"));
}
async function finishOnlineActivation(onlineActivation, normalizedUsername) {
    const userId = await upsertOfflineUser(onlineActivation.data, "", onlineActivation.data.passwordHash);
    const verifiedUser = await (0, db_service_1.queryOne)(`SELECT user_id FROM users WHERE user_id = $1 AND deleted_at IS NULL`, [userId]);
    const resolvedUserId = verifiedUser?.user_id ??
        (await (0, db_service_1.queryOne)(`SELECT user_id FROM users WHERE LOWER(username) = LOWER($1) AND deleted_at IS NULL`, [onlineActivation.data.username]))?.user_id ??
        userId;
    if (onlineActivation.data.serialKey) {
        await upsertOfflineSerialKey(onlineActivation.data.serialKey, resolvedUserId, "used", {
            company: onlineActivation.data.company,
            department: onlineActivation.data.department,
        });
    }
    rememberSupportContact(resolvedUserId, onlineActivation.data.username, onlineActivation.data.adminContact);
    if (onlineActivation.data.adminContact ||
        onlineActivation.data.company ||
        onlineActivation.data.department) {
        await persistAccountContextToUser(resolvedUserId, {
            adminContact: {
                adminName: onlineActivation.data.adminContact?.adminName ?? null,
                email: onlineActivation.data.adminContact?.email ?? null,
                phoneNumber: onlineActivation.data.adminContact?.phoneNumber ?? null,
            },
            company: onlineActivation.data.company ?? null,
            department: onlineActivation.data.department ?? null,
        });
    }
    const token = (0, crypto_1.randomUUID)();
    rememberSession({
        token,
        userId: resolvedUserId,
        role: "user",
        expiresAt: Date.now() + USER_SESSION_MS,
    });
    void device_service_1.deviceService.syncClientDevicesForUser(resolvedUserId, normalizedUsername);
    return { success: true, userId: resolvedUserId, token, role: "user" };
}
async function syncPendingOnlineActivations() {
    const pending = (0, pending_activation_store_1.listPendingActivations)();
    if (!pending.length)
        return;
    for (const entry of pending) {
        const result = await (0, api_service_1.activateUserAccountOnline)({
            serialKey: entry.serialKey,
            username: entry.username,
        });
        if (!result.success) {
            const message = extractApiMessage(result.error ?? "");
            if (message.toLowerCase().includes("already activated") ||
                message.toLowerCase().includes("already active")) {
                (0, pending_activation_store_1.removePendingActivation)(entry.serialKey);
            }
            continue;
        }
        (0, pending_activation_store_1.removePendingActivation)(entry.serialKey);
        if (result.data) {
            await upsertOfflineUser(result.data, "", result.data.passwordHash);
            await (0, db_service_1.query)(`UPDATE users SET account_status = 'active', updated_at = NOW() WHERE user_id = $1`, [entry.userId]);
        }
    }
}
async function tryOfflineActivation(normalizedKey, normalizedUsername) {
    const key = await keys_service_1.keysService.findKey(normalizedKey);
    if (!key) {
        return { success: false, error: "Invalid serial key" };
    }
    if (key.status !== "unused" && key.status !== "assigned") {
        return { success: false, error: `Serial key is ${key.status}` };
    }
    let user = await (0, db_service_1.queryOne)(`SELECT user_id, username, account_status, serial_key, password_hash
     FROM users
     WHERE LOWER(username) = LOWER($1)`, [normalizedUsername]);
    if (!user && key.assigned_to) {
        user = await (0, db_service_1.queryOne)(`SELECT user_id, username, account_status, serial_key, password_hash
       FROM users
       WHERE user_id = $1`, [key.assigned_to]);
    }
    if (!user) {
        return {
            success: false,
            error: "Account not found on this device. Sign in once while online, or ask your administrator to register your account.",
        };
    }
    if (user.username.trim().toLowerCase() !== normalizedUsername.toLowerCase()) {
        return { success: false, error: "Serial key does not match this username" };
    }
    if (user.account_status === "active") {
        return { success: false, error: "Account is already activated" };
    }
    const userKey = (user.serial_key ?? "").trim().toLowerCase();
    const keyMatchesUser = userKey === normalizedKey.toLowerCase() ||
        key.assigned_to === user.user_id;
    if (!keyMatchesUser) {
        return { success: false, error: "Serial key does not match this account" };
    }
    await (0, db_service_1.query)(`UPDATE users
     SET account_status = 'active', serial_key = $1, updated_at = NOW()
     WHERE user_id = $2`, [normalizedKey, user.user_id]);
    await keys_service_1.keysService.markUsed(normalizedKey, user.user_id);
    (0, pending_activation_store_1.queuePendingActivation)({
        userId: user.user_id,
        username: user.username,
        serialKey: normalizedKey,
        activatedAt: new Date().toISOString(),
    });
    const token = (0, crypto_1.randomUUID)();
    rememberSession({
        token,
        userId: user.user_id,
        role: "user",
        expiresAt: Date.now() + USER_SESSION_MS,
    });
    void device_service_1.deviceService.syncClientDevicesForUser(user.user_id, normalizedUsername);
    setImmediate(() => {
        void syncPendingOnlineActivations();
    });
    return { success: true, userId: user.user_id, token, role: "user" };
}
const OFFLINE_ACTIVATION_TIMEOUT_MS = 6_000;
const ACTIVATION_RACE_TIMEOUT_MS = 10_000;
function withActivationTimeout(promise, timeoutMs, fallback) {
    return Promise.race([
        promise,
        new Promise((resolve) => {
            setTimeout(() => resolve(fallback), timeoutMs);
        }),
    ]);
}
async function raceActivationAttempts(normalizedKey, normalizedUsername) {
    return new Promise((resolve) => {
        let settled = false;
        let onlineError = "Could not reach the online API";
        let offlineError = "Activation failed";
        const finish = (outcome) => {
            if (settled)
                return;
            settled = true;
            resolve(outcome);
        };
        const timer = setTimeout(() => {
            finish({
                source: "failed",
                onlineError: onlineError || "Activation timed out",
                offlineError: offlineError || "Activation timed out",
            });
        }, ACTIVATION_RACE_TIMEOUT_MS);
        const offlinePromise = withActivationTimeout(tryOfflineActivation(normalizedKey, normalizedUsername).catch(() => ({ success: false, error: "Offline activation failed" })), OFFLINE_ACTIVATION_TIMEOUT_MS, { success: false, error: "Offline activation timed out" });
        const onlinePromise = (async () => {
            const gatewayUp = await (0, gateway_discovery_service_1.probeGatewayHealth)((0, gateway_config_service_1.getGatewayApiUrl)(), 400);
            if (!gatewayUp) {
                return { success: false, error: "Could not reach the online API" };
            }
            return (0, api_service_1.activateUserAccountOnline)({
                serialKey: normalizedKey,
                username: normalizedUsername,
            });
        })().catch(() => ({ success: false, error: "Could not reach the online API" }));
        void offlinePromise.then((offlineResult) => {
            if (offlineResult.success) {
                clearTimeout(timer);
                finish({ source: "offline", result: offlineResult });
            }
        });
        void onlinePromise.then((onlineActivation) => {
            if (onlineActivation.success && onlineActivation.data) {
                clearTimeout(timer);
                finish({ source: "online", data: onlineActivation.data });
            }
        });
        void Promise.all([offlinePromise, onlinePromise]).then(([offlineResult, onlineActivation]) => {
            clearTimeout(timer);
            if (settled)
                return;
            if (!offlineResult.success) {
                offlineError = offlineResult.error ?? offlineError;
            }
            onlineError = onlineActivation.success
                ? onlineError
                : extractApiMessage(onlineActivation.error ?? onlineError);
            finish({ source: "failed", onlineError, offlineError });
        });
    });
}
async function findLocalUserByUsername(username) {
    return (0, db_service_1.queryOne)(`SELECT user_id, password_hash, account_status, role_id
     FROM users
     WHERE LOWER(username) = LOWER($1)
       AND deleted_at IS NULL`, [username]);
}
exports.authService = {
    initStores(userDataPath) {
        (0, online_auth_store_1.initOnlineAuthStore)(userDataPath);
        (0, pending_activation_store_1.initPendingActivationStore)(userDataPath);
    },
    restorePersistedSessions() {
        purgeExpiredSessions();
        for (const session of (0, session_store_1.loadStoredSessions)()) {
            if (session.expiresAt > Date.now()) {
                sessions.set(session.token, session);
            }
        }
        restoreOnlineAuthForSessions();
    },
    async login(username, password) {
        const lock = failedAttempts.get(username);
        if (lock && lock.lockedUntil > Date.now()) {
            return { success: false, error: "Account locked. Try again later." };
        }
        let user = await findLocalUserByUsername(username);
        if (user) {
            if (user.account_status !== "active") {
                return { success: false, error: NOT_ACTIVATED_ERROR };
            }
            const valid = await hash_service_1.hashService.verifyPassword(user.password_hash, password);
            if (!valid)
                return bumpFail(username, "Invalid credentials");
            failedAttempts.delete(username);
            const token = createUserSession(user.user_id);
            const loggedInUserId = user.user_id;
            await (0, db_service_1.query)("INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)", [loggedInUserId, "login", JSON.stringify({ method: "password" })]);
            void syncUserFromOnline(username, password);
            void authenticateOnline(loggedInUserId, username, password).then(async (online) => {
                if (online) {
                    await resolveAccountContext(loggedInUserId, username);
                    await syncPendingOnlineActivations();
                }
            });
            void device_service_1.deviceService.syncClientDevicesForUser(loggedInUserId, username);
            return { success: true, token, role: "user", userId: loggedInUserId };
        }
        const synced = await syncUserFromOnline(username, password);
        if (synced.success) {
            user = await findLocalUserByUsername(synced.data.username ?? username);
            if (!user) {
                return {
                    success: false,
                    error: "Account synced but could not be loaded locally. Restart the app and try again.",
                };
            }
            if (user.account_status !== "active") {
                return { success: false, error: NOT_ACTIVATED_ERROR };
            }
            const valid = await hash_service_1.hashService.verifyPassword(user.password_hash, password);
            if (!valid)
                return bumpFail(username, "Invalid credentials");
            failedAttempts.delete(username);
            const token = createUserSession(user.user_id);
            await (0, db_service_1.query)("INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)", [user.user_id, "login", JSON.stringify({ method: "password", source: "online-sync" })]);
            void authenticateOnline(user.user_id, username, password);
            void device_service_1.deviceService.syncClientDevicesForUser(user.user_id, username);
            return { success: true, token, role: "user", userId: user.user_id };
        }
        if (synced.error === NOT_ACTIVATED_ERROR) {
            return { success: false, error: NOT_ACTIVATED_ERROR };
        }
        return bumpFail(username, "Invalid credentials");
    },
    async logout(token) {
        await device_presence_service_1.devicePresenceService.stop();
        forgetSession(token);
        (0, api_service_1.setOnlineAccessToken)(null);
        (0, online_auth_store_1.clearOnlineAuth)();
        return { success: true };
    },
    async activateKey(serialKey, username) {
        try {
            const normalizedUsername = username.trim();
            const normalizedKey = serialKey.trim();
            if (!keys_service_1.keysService.validateFormat(normalizedKey)) {
                return { success: false, error: "Invalid serial key format" };
            }
            const outcome = await raceActivationAttempts(normalizedKey, normalizedUsername);
            if (outcome.source === "online") {
                return await finishOnlineActivation({ data: outcome.data }, normalizedUsername);
            }
            if (outcome.source === "offline") {
                return outcome.result;
            }
            const { onlineError, offlineError } = outcome;
            if (onlineError && !isOnlineUnavailableMessage(onlineError)) {
                return { success: false, error: onlineError };
            }
            if (isOnlineUnavailableMessage(onlineError)) {
                if (offlineError.toLowerCase().includes("account not found")) {
                    return {
                        success: false,
                        error: "Could not reach the online API. Start the gateway and connect to activate your account.",
                    };
                }
                return { success: false, error: offlineError || onlineError };
            }
            return { success: false, error: onlineError || offlineError || "Activation failed" };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Activation failed",
            };
        }
    },
    async checkSession(token) {
        purgeExpiredSessions();
        let session = sessions.get(token);
        if (!session) {
            for (const stored of (0, session_store_1.loadStoredSessions)()) {
                if (stored.token === token && stored.expiresAt > Date.now()) {
                    session = stored;
                    sessions.set(stored.token, stored);
                    break;
                }
            }
        }
        if (!session)
            return { valid: false, remainingMs: 0 };
        const remainingMs = session.expiresAt - Date.now();
        if (remainingMs <= 0) {
            forgetSession(token);
            return { valid: false, remainingMs: 0 };
        }
        const user = await (0, db_service_1.queryOne)(`SELECT account_status
       FROM users
       WHERE user_id = $1
         AND deleted_at IS NULL`, [session.userId]);
        if (!user || user.account_status === "deleted") {
            forgetSession(token);
            return { valid: false, remainingMs: 0 };
        }
        session.expiresAt = Date.now() + USER_SESSION_MS;
        rememberSession(session);
        return { valid: true, remainingMs: session.expiresAt - Date.now() };
    },
    getSession(token) {
        return sessions.get(token) ?? null;
    },
    async requestRecovery(payload) {
        const result = await (0, api_service_1.submitUserRecovery)(payload);
        if (!result.success) {
            return { success: false, error: result.error };
        }
        await (0, db_service_1.query)("INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)", [null, "recovery_requested", JSON.stringify({ channel: payload.channel, context: payload.context ?? null })]);
        return { success: true, requestId: result.data.requestId };
    },
    async getProfile(token) {
        const session = sessions.get(token);
        if (!session)
            return { success: false, error: "Session expired" };
        const user = await (0, db_service_1.queryOne)(`SELECT user_id, username, first_name, last_name, email, phone_number, company, department,
              serial_key, account_status, contact_saved_by_user
       FROM users
       WHERE user_id = $1 AND deleted_at IS NULL`, [session.userId]);
        if (!user)
            return { success: false, error: "Account not found" };
        const accountContext = await resolveAccountContext(session.userId, user.username);
        const { adminContact } = accountContext;
        let company = user.company?.trim() || accountContext.company?.trim() || null;
        let department = user.department?.trim() || accountContext.department?.trim() || null;
        if (company !== user.company || department !== user.department) {
            await (0, db_service_1.query)(`UPDATE users SET company = $1, department = $2, updated_at = NOW() WHERE user_id = $3`, [company, department, session.userId]);
        }
        let { email, phoneNumber } = sanitizeUserContactFields(user.email, user.phone_number, adminContact);
        let contactSavedByUser = Boolean(user.contact_saved_by_user);
        if (!contactSavedByUser && (email || phoneNumber)) {
            contactSavedByUser = true;
        }
        if (!contactSavedByUser) {
            email = null;
            phoneNumber = null;
        }
        const dbUpdates = [];
        const dbParams = [];
        let paramIndex = 1;
        if (email !== user.email) {
            dbUpdates.push(`email = $${paramIndex++}`);
            dbParams.push(email);
        }
        if (phoneNumber !== user.phone_number) {
            dbUpdates.push(`phone_number = $${paramIndex++}`);
            dbParams.push(phoneNumber);
        }
        if (contactSavedByUser !== Boolean(user.contact_saved_by_user)) {
            dbUpdates.push(`contact_saved_by_user = $${paramIndex++}`);
            dbParams.push(contactSavedByUser);
        }
        if (dbUpdates.length > 0) {
            dbParams.push(session.userId);
            await (0, db_service_1.query)(`UPDATE users SET ${dbUpdates.join(", ")}, updated_at = NOW() WHERE user_id = $${paramIndex}`, dbParams);
        }
        return {
            success: true,
            profile: {
                userId: user.user_id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email,
                phoneNumber,
                company,
                department,
                serialKey: user.serial_key,
                accountStatus: user.account_status,
                adminContact,
            },
        };
    },
    async updateProfile(token, payload) {
        const session = sessions.get(token);
        if (!session)
            return { success: false, error: "Session expired" };
        const accountContext = await loadLocalAccountContext(session.userId);
        const sanitized = sanitizeUserContactFields(payload.email, payload.phoneNumber, accountContext.adminContact);
        const savingContact = payload.email !== undefined || payload.phoneNumber !== undefined;
        const contactSavedByUser = savingContact
            ? Boolean(sanitized.email || sanitized.phoneNumber)
            : undefined;
        await (0, db_service_1.query)(`UPDATE users
       SET first_name = CASE WHEN $6 THEN $1 ELSE first_name END,
           last_name = CASE WHEN $7 THEN $2 ELSE last_name END,
           email = CASE WHEN $8 THEN $3 ELSE email END,
           phone_number = CASE WHEN $9 THEN $4 ELSE phone_number END,
           contact_saved_by_user = CASE
             WHEN $10 THEN $5
             ELSE contact_saved_by_user
           END,
           updated_at = NOW()
       WHERE user_id = $11`, [
            payload.firstName?.trim() || null,
            payload.lastName?.trim() || null,
            payload.email !== undefined ? sanitized.email : null,
            payload.phoneNumber !== undefined ? sanitized.phoneNumber : null,
            contactSavedByUser ?? false,
            payload.firstName !== undefined,
            payload.lastName !== undefined,
            payload.email !== undefined,
            payload.phoneNumber !== undefined,
            contactSavedByUser !== undefined,
            session.userId,
        ]);
        void (0, api_service_1.updateUserProfileOnline)({
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: sanitized.email ?? undefined,
            phoneNumber: sanitized.phoneNumber ?? undefined,
        });
        return this.getProfile(token);
    },
    async changePassword(token, currentPassword, newPassword) {
        const session = sessions.get(token);
        if (!session)
            return { success: false, error: "Session expired" };
        const user = await (0, db_service_1.queryOne)("SELECT password_hash FROM users WHERE user_id = $1", [session.userId]);
        if (!user)
            return { success: false, error: "Account not found" };
        const valid = await hash_service_1.hashService.verifyPassword(user.password_hash, currentPassword);
        if (!valid)
            return { success: false, error: "Current password is incorrect" };
        const nextHash = await hash_service_1.hashService.hashPassword(newPassword);
        await (0, db_service_1.query)("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2", [
            nextHash,
            session.userId,
        ]);
        void (0, api_service_1.changeUserPasswordOnline)(currentPassword, newPassword);
        return { success: true };
    },
    async getSupportContact(token, username, serialKey) {
        const normalizedUsername = username?.trim() || undefined;
        const normalizedSerialKey = serialKey?.trim() || undefined;
        const emptyContact = {
            adminName: null,
            email: null,
            phoneNumber: null,
        };
        const hasContact = (contact) => Boolean(contact.adminName?.trim() || contact.email?.trim() || contact.phoneNumber?.trim());
        const publicOnline = await (0, api_service_1.fetchPublicSupportContactOnline)({
            username: normalizedUsername,
            serialKey: normalizedSerialKey,
        });
        if (publicOnline.success && publicOnline.contact && hasContact(publicOnline.contact)) {
            if (normalizedUsername) {
                const user = await (0, db_service_1.queryOne)("SELECT user_id FROM users WHERE LOWER(username) = LOWER($1)", [normalizedUsername]);
                if (user) {
                    rememberSupportContact(user.user_id, normalizedUsername, publicOnline.contact);
                }
                else {
                    (0, online_auth_store_1.saveSupportContact)(0, {
                        username: normalizedUsername,
                        adminName: publicOnline.contact.adminName ?? null,
                        email: publicOnline.contact.email ?? null,
                        phoneNumber: publicOnline.contact.phoneNumber ?? null,
                    });
                }
            }
            return { success: true, contact: publicOnline.contact };
        }
        if (normalizedUsername) {
            const localByUsername = await (0, db_service_1.queryOne)(`SELECT user_id, admin_contact_name, admin_contact_email, admin_contact_phone
         FROM users
         WHERE LOWER(username) = LOWER($1)`, [normalizedUsername]);
            if (localByUsername) {
                const contact = {
                    adminName: localByUsername.admin_contact_name?.trim() || null,
                    email: localByUsername.admin_contact_email?.trim() || null,
                    phoneNumber: localByUsername.admin_contact_phone?.trim() || null,
                };
                if (hasContact(contact)) {
                    rememberSupportContact(localByUsername.user_id, normalizedUsername, contact);
                    return { success: true, contact };
                }
            }
        }
        if (normalizedSerialKey) {
            const localBySerial = await (0, db_service_1.queryOne)(`SELECT u.user_id, u.username, u.admin_contact_name, u.admin_contact_email, u.admin_contact_phone
         FROM users u
         WHERE LOWER(COALESCE(u.serial_key, '')) = LOWER($1)
            OR EXISTS (
              SELECT 1
              FROM serial_keys sk
              WHERE sk.assigned_to = u.user_id
                AND LOWER(sk.serial_key) = LOWER($1)
            )
         ORDER BY u.user_id ASC
         LIMIT 1`, [normalizedSerialKey]);
            if (localBySerial) {
                const contact = {
                    adminName: localBySerial.admin_contact_name?.trim() || null,
                    email: localBySerial.admin_contact_email?.trim() || null,
                    phoneNumber: localBySerial.admin_contact_phone?.trim() || null,
                };
                if (hasContact(contact)) {
                    rememberSupportContact(localBySerial.user_id, localBySerial.username, contact);
                    return { success: true, contact };
                }
            }
        }
        const session = token ? sessions.get(token) : undefined;
        if (session) {
            const online = await (0, api_service_1.fetchUserSupportContactOnline)();
            if (online.success && online.contact && hasContact(online.contact)) {
                const user = await (0, db_service_1.queryOne)("SELECT username FROM users WHERE user_id = $1", [session.userId]);
                rememberSupportContact(session.userId, user?.username ?? normalizedUsername ?? "", online.contact);
                return { success: true, contact: online.contact };
            }
            const localContext = await loadLocalAccountContext(session.userId);
            if (hasContact(localContext.adminContact)) {
                return { success: true, contact: localContext.adminContact };
            }
        }
        const cached = (session ? (0, online_auth_store_1.loadSupportContact)(session.userId) : null) ??
            (normalizedUsername ? (0, online_auth_store_1.loadSupportContact)(undefined, normalizedUsername) : (0, online_auth_store_1.loadSupportContact)());
        if (cached && hasContact(cached)) {
            return {
                success: true,
                contact: {
                    adminName: cached.adminName,
                    email: cached.email,
                    phoneNumber: cached.phoneNumber,
                },
            };
        }
        return {
            success: true,
            contact: emptyContact,
        };
    },
    async syncPendingActivations() {
        await syncPendingOnlineActivations();
        return { success: true };
    },
};
function bumpFail(username, error) {
    const prev = failedAttempts.get(username) ?? { count: 0, lockedUntil: 0 };
    const count = prev.count + 1;
    if (count >= 5) {
        failedAttempts.set(username, {
            count,
            lockedUntil: Date.now() + 15 * 60 * 1000,
        });
        return { success: false, error: "Account locked after 5 failed attempts" };
    }
    failedAttempts.set(username, { count, lockedUntil: 0 });
    return { success: false, error };
}
