import { randomUUID } from "crypto";
import { query, queryOne } from "./db.service";
import { deviceService } from "./device.service";
import { devicePresenceService } from "./device-presence.service";
import { hashService } from "./hash.service";
import { keysService } from "./keys.service";
import { getGatewayApiUrl, setGatewayApiUrl } from "./gateway-config.service";
import {
  discoverGatewayUrl,
  discoverGatewayUrlFast,
  probeGatewayHealth,
} from "./gateway-discovery.service";
import {
  activateUserAccountOnline,
  changeUserPasswordOnline,
  fetchUserSupportContactOnline,
  fetchPublicSupportContactOnline,
  isOnlineAvailable,
  loginOnline,
  setOnlineAccessToken,
  submitUserRecovery as submitUserRecoveryOnline,
  syncUserAccountOnline,
  updateUserProfileOnline,
} from "./api.service";
import {
  clearOnlineAuth,
  initOnlineAuthStore,
  loadOnlineAuth,
  loadSupportContact,
  saveOnlineAuth,
  saveSupportContact,
} from "./online-auth-store";
import { loadStoredSessions, saveStoredSessions } from "./session-store";
import {
  initPendingActivationStore,
  listPendingActivations,
  queuePendingActivation,
  removePendingActivation,
} from "./pending-activation-store";

type Session = {
  token: string;
  userId: number;
  role: "user" | "admin";
  expiresAt: number;
};

const NOT_ACTIVATED_ERROR = "Account not Activated : Activate account first to access";

const sessions = new Map<string, Session>();
type FailedLoginState = { count: number; lockedUntil: number; lockTier: number };
const failedAttempts = new Map<string, FailedLoginState>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_DURATIONS_MS = [30_000, 60_000, 120_000, 300_000, 600_000, 900_000, 1_800_000];
const USER_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function persistSessions() {
  saveStoredSessions([...sessions.values()]);
}

function rememberSession(session: Session) {
  sessions.set(session.token, session);
  persistSessions();
}

function forgetSession(token: string) {
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

  if (changed) persistSessions();
}

type SyncedUserAccount = {
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
  adminContact?: {
    adminName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
};

function rememberOnlineAuth(userId: number, token: string) {
  setOnlineAccessToken(token);
  saveOnlineAuth(userId, token);
}

function rememberSupportContact(
  userId: number,
  username: string,
  contact?: SyncedUserAccount["adminContact"],
) {
  if (!contact) return;
  saveSupportContact(userId, {
    username,
    adminName: contact.adminName ?? null,
    email: contact.email ?? null,
    phoneNumber: contact.phoneNumber ?? null,
  });
}

async function authenticateOnline(userId: number, username: string, password: string) {
  const onlineLogin = await loginOnline(username, password);
  if (onlineLogin.success) {
    rememberOnlineAuth(userId, onlineLogin.accessToken);
    return true;
  }

  const stored = loadOnlineAuth(userId);
  if (stored?.accessToken) {
    setOnlineAccessToken(stored.accessToken);
    return true;
  }

  return false;
}

function sanitizeUserContactFields(
  email: string | null | undefined,
  phoneNumber: string | null | undefined,
  adminContact?: SyncedUserAccount["adminContact"] | null,
) {
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
  if (activeSessions.length === 0) return;

  const latest = activeSessions.sort((a, b) => b.expiresAt - a.expiresAt)[0];
  const stored = loadOnlineAuth(latest.userId);
  if (stored?.accessToken) {
    setOnlineAccessToken(stored.accessToken);
  }
}

type ResolvedAccountContext = {
  adminContact: {
    adminName: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
  company: string | null;
  department: string | null;
};

const emptyAccountContext = (): ResolvedAccountContext => ({
  adminContact: { adminName: null, email: null, phoneNumber: null },
  company: null,
  department: null,
});

function hasAdminContact(context: ResolvedAccountContext) {
  const { adminContact } = context;
  return Boolean(
    adminContact.adminName?.trim() ||
      adminContact.email?.trim() ||
      adminContact.phoneNumber?.trim(),
  );
}

function mergeAccountContext(
  base: ResolvedAccountContext,
  incoming: Partial<ResolvedAccountContext>,
): ResolvedAccountContext {
  return {
    adminContact: {
      adminName:
        incoming.adminContact?.adminName?.trim() ||
        base.adminContact.adminName?.trim() ||
        null,
      email: incoming.adminContact?.email?.trim() || base.adminContact.email?.trim() || null,
      phoneNumber:
        incoming.adminContact?.phoneNumber?.trim() ||
        base.adminContact.phoneNumber?.trim() ||
        null,
    },
    company: incoming.company?.trim() || base.company?.trim() || null,
    department: incoming.department?.trim() || base.department?.trim() || null,
  };
}

async function loadLocalAccountContext(userId: number): Promise<ResolvedAccountContext> {
  const row = await queryOne<{
    admin_contact_name: string | null;
    admin_contact_email: string | null;
    admin_contact_phone: string | null;
    company: string | null;
    department: string | null;
    serial_key: string | null;
    key_company: string | null;
    key_department: string | null;
  }>(
    `SELECT
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
     WHERE u.user_id = $1`,
    [userId],
  );

  if (!row) return emptyAccountContext();

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

async function persistAccountContextToUser(userId: number, context: ResolvedAccountContext) {
  const { adminContact, company, department } = context;
  await query(
    `UPDATE users
     SET admin_contact_name = COALESCE($1, admin_contact_name),
         admin_contact_email = COALESCE($2, admin_contact_email),
         admin_contact_phone = COALESCE($3, admin_contact_phone),
         company = COALESCE($4, company),
         department = COALESCE($5, department),
         updated_at = NOW()
     WHERE user_id = $6`,
    [
      adminContact.adminName?.trim() || null,
      adminContact.email?.trim() || null,
      adminContact.phoneNumber?.trim() || null,
      company?.trim() || null,
      department?.trim() || null,
      userId,
    ],
  );
}

async function resolveAccountContext(
  userId: number,
  username: string,
): Promise<ResolvedAccountContext> {
  let context = await loadLocalAccountContext(userId);

  const online = await fetchUserSupportContactOnline();
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

  const cached = loadSupportContact(userId, username);
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

async function realignOfflineUserId(fromId: number, toId: number) {
  if (fromId === toId) return;

  await query(`UPDATE devices SET assigned_user = $1 WHERE assigned_user = $2`, [toId, fromId]);
  await query(`UPDATE serial_keys SET assigned_to = $1 WHERE assigned_to = $2`, [toId, fromId]);
  await query(`UPDATE documents SET uploaded_by = $1 WHERE uploaded_by = $2`, [toId, fromId]);
  await query(`UPDATE scan_history SET scanned_by = $1 WHERE scanned_by = $2`, [toId, fromId]);
  await query(`UPDATE folders SET created_by = $1 WHERE created_by = $2`, [toId, fromId]);
  await query(`UPDATE activity_logs SET user_id = $1 WHERE user_id = $2`, [toId, fromId]);
  await query(`UPDATE users SET user_id = $1 WHERE user_id = $2`, [toId, fromId]);
}

async function upsertOfflineUser(account: SyncedUserAccount, password = "", passwordHash?: string) {
  let hash =
    passwordHash ??
    (password ? await hashService.hashPassword(password) : null);

  if (!hash) {
    const existing = await queryOne<{ password_hash: string }>(
      "SELECT password_hash FROM users WHERE LOWER(username) = LOWER($1)",
      [account.username],
    );
    hash = existing?.password_hash ?? null;
  }

  if (!hash) {
    throw new Error("Missing password hash for offline account sync");
  }
  const existing = await queryOne<{ user_id: number }>(
    "SELECT user_id FROM users WHERE LOWER(username) = LOWER($1)",
    [account.username],
  );

  if (existing) {
    if (existing.user_id !== account.userId) {
      const targetExists = await queryOne<{ user_id: number }>(
        "SELECT user_id FROM users WHERE user_id = $1",
        [account.userId],
      );
      if (!targetExists) {
        await realignOfflineUserId(existing.user_id, account.userId);
        existing.user_id = account.userId;
      }
    }

    const sanitized = sanitizeUserContactFields(
      account.email,
      account.phoneNumber,
      account.adminContact,
    );
    const adminContactName = account.adminContact?.adminName?.trim() || null;
    const adminContactEmail = account.adminContact?.email?.trim() || null;
    const adminContactPhone = account.adminContact?.phoneNumber?.trim() || null;

    await query(
      `UPDATE users
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
       WHERE user_id = $15`,
      [
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
      ],
    );
    return existing.user_id;
  }

  const sanitized = sanitizeUserContactFields(
    account.email,
    account.phoneNumber,
    account.adminContact,
  );
  const adminContactName = account.adminContact?.adminName?.trim() || null;
  const adminContactEmail = account.adminContact?.email?.trim() || null;
  const adminContactPhone = account.adminContact?.phoneNumber?.trim() || null;

  const rows = await query<{ user_id: number }>(
    `INSERT INTO users (
       user_id, username, password_hash, first_name, last_name, email, phone_number,
       account_status, role_id, serial_key, company, department,
       admin_contact_name, admin_contact_email, admin_contact_phone, contact_saved_by_user
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, $10, $11, $12, $13, $14, $15)
     RETURNING user_id`,
    [
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
    ],
  );

  return rows[0]?.user_id ?? account.userId;
}

async function upsertOfflineSerialKey(
  serialKey: string,
  userId: number,
  status: string,
  meta?: { company?: string | null; department?: string | null },
) {
  const existing = await queryOne("SELECT serial_id FROM serial_keys WHERE LOWER(serial_key) = LOWER($1)", [
    serialKey.trim(),
  ]);
  const company = meta?.company?.trim() || null;
  const department = meta?.department?.trim() || null;

  if (existing) {
    await query(
      `UPDATE serial_keys
       SET status = $1,
           assigned_to = $2,
           company = COALESCE($4, company),
           department = COALESCE($5, department),
           used_at = CASE WHEN $6 THEN NOW() ELSE used_at END
       WHERE LOWER(serial_key) = LOWER($3)`,
      [status, userId, serialKey.trim(), company, department, status === "used"],
    );
    return;
  }

  await query(
    `INSERT INTO serial_keys (serial_key, assigned_to, status, company, department, used_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [serialKey.trim(), userId, status, company, department, status === "used" ? new Date() : null],
  );
}

function extractApiMessage(error: string) {
  try {
    const parsed = JSON.parse(error) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) return parsed.message.join(" ");
    if (parsed.message) return parsed.message;
  } catch {
    /* keep raw text */
  }
  return error;
}

function isNotActivatedMessage(message: string) {
  return message.includes("Account not Activated");
}

async function syncUserFromOnline(username: string, password: string) {
  const result = await syncUserAccountOnline(username, password);
  if (!result.success || !result.data) {
    const message = extractApiMessage(result.error ?? "");
    if (isNotActivatedMessage(message)) {
      return { success: false as const, error: NOT_ACTIVATED_ERROR };
    }
    return { success: false as const, error: result.error };
  }

  const userId = await upsertOfflineUser(result.data, password);
  if (result.data.serialKey) {
    await upsertOfflineSerialKey(
      result.data.serialKey,
      userId,
      result.data.serialKeyStatus === "used" ? "used" : "assigned",
      { company: result.data.company, department: result.data.department },
    );
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

  return { success: true as const, data: result.data };
}

function createUserSession(userId: number) {
  const token = randomUUID();
  const session: Session = {
    token,
    userId,
    role: "user",
    expiresAt: Date.now() + USER_SESSION_MS,
  };
  rememberSession(session);
  return token;
}

function isOnlineUnavailableMessage(message: string) {
  return (
    message === "Could not reach the online API" ||
    message.toLowerCase().includes("fetch failed") ||
    message.toLowerCase().includes("network")
  );
}

const NETWORK_LOGIN_ERROR =
  "Could not reach the server. Connect to your office network and try again.";

function isInvalidCredentialsMessage(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("invalid credentials") || lower.includes("invalid username or password");
}

async function ensureGatewayReachable() {
  const current = getGatewayApiUrl();
  if (await isOnlineAvailable(current)) return true;

  const discovered =
    (await discoverGatewayUrlFast(current)) ?? (await discoverGatewayUrl(current));
  if (discovered) {
    setGatewayApiUrl(discovered);
    return true;
  }
  return false;
}

async function refreshLocalUserFromOnline(username: string, password: string) {
  const synced = await syncUserFromOnline(username, password);
  if (!synced.success) {
    return { synced, user: null as Awaited<ReturnType<typeof findLocalUserByUsername>> };
  }
  const user = await findLocalUserByUsername(username);
  return { synced, user };
}

type ActivateKeyResult =
  | { success: true; userId: number; token: string; role: "user" }
  | { success: false; error: string };

async function finishOnlineActivation(
  onlineActivation: { data: SyncedUserAccount & { passwordHash?: string; serialKey?: string | null } },
  normalizedUsername: string,
): Promise<ActivateKeyResult> {
  const userId = await upsertOfflineUser(
    onlineActivation.data,
    "",
    onlineActivation.data.passwordHash,
  );
  const verifiedUser = await queryOne<{ user_id: number }>(
    `SELECT user_id FROM users WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId],
  );
  const resolvedUserId =
    verifiedUser?.user_id ??
    (
      await queryOne<{ user_id: number }>(
        `SELECT user_id FROM users WHERE LOWER(username) = LOWER($1) AND deleted_at IS NULL`,
        [onlineActivation.data.username],
      )
    )?.user_id ??
    userId;

  if (onlineActivation.data.serialKey) {
    await upsertOfflineSerialKey(onlineActivation.data.serialKey, resolvedUserId, "used", {
      company: onlineActivation.data.company,
      department: onlineActivation.data.department,
    });
  }
  rememberSupportContact(resolvedUserId, onlineActivation.data.username, onlineActivation.data.adminContact);
  if (
    onlineActivation.data.adminContact ||
    onlineActivation.data.company ||
    onlineActivation.data.department
  ) {
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

  const token = randomUUID();
  rememberSession({
    token,
    userId: resolvedUserId,
    role: "user",
    expiresAt: Date.now() + USER_SESSION_MS,
  });

  void deviceService.syncClientDevicesForUser(resolvedUserId, normalizedUsername);

  return { success: true, userId: resolvedUserId, token, role: "user" as const };
}

async function syncPendingOnlineActivations() {
  const pending = listPendingActivations();
  if (!pending.length) return;

  for (const entry of pending) {
    const result = await activateUserAccountOnline({
      serialKey: entry.serialKey,
      username: entry.username,
    });

    if (!result.success) {
      const message = extractApiMessage(result.error ?? "");
      if (
        message.toLowerCase().includes("already activated") ||
        message.toLowerCase().includes("already active")
      ) {
        removePendingActivation(entry.serialKey);
      }
      continue;
    }

    removePendingActivation(entry.serialKey);

    if (result.data) {
      await upsertOfflineUser(result.data, "", result.data.passwordHash);
      await query(
        `UPDATE users SET account_status = 'active', updated_at = NOW() WHERE user_id = $1`,
        [entry.userId],
      );
    }
  }
}

async function tryOfflineActivation(
  normalizedKey: string,
  normalizedUsername: string,
): Promise<ActivateKeyResult> {
  const key = await keysService.findKey(normalizedKey);
  if (!key) {
    return { success: false, error: "Invalid serial key" };
  }

  if (key.status !== "unused" && key.status !== "assigned") {
    return { success: false, error: `Serial key is ${key.status}` };
  }

  let user = await queryOne<{
    user_id: number;
    username: string;
    account_status: string;
    serial_key: string | null;
    password_hash: string;
  }>(
    `SELECT user_id, username, account_status, serial_key, password_hash
     FROM users
     WHERE LOWER(username) = LOWER($1)`,
    [normalizedUsername],
  );

  if (!user && key.assigned_to) {
    user = await queryOne<{
      user_id: number;
      username: string;
      account_status: string;
      serial_key: string | null;
      password_hash: string;
    }>(
      `SELECT user_id, username, account_status, serial_key, password_hash
       FROM users
       WHERE user_id = $1`,
      [key.assigned_to],
    );
  }

  if (!user) {
    return {
      success: false,
      error:
        "Account not found on this device. Sign in once while online, or ask your administrator to register your account.",
    };
  }

  if (user.username.trim().toLowerCase() !== normalizedUsername.toLowerCase()) {
    return { success: false, error: "Serial key does not match this username" };
  }

  if (user.account_status === "active") {
    return { success: false, error: "Account is already activated" };
  }

  const userKey = (user.serial_key ?? "").trim().toLowerCase();
  const keyMatchesUser =
    userKey === normalizedKey.toLowerCase() ||
    key.assigned_to === user.user_id;

  if (!keyMatchesUser) {
    return { success: false, error: "Serial key does not match this account" };
  }

  await query(
    `UPDATE users
     SET account_status = 'active', serial_key = $1, updated_at = NOW()
     WHERE user_id = $2`,
    [normalizedKey, user.user_id],
  );
  await keysService.markUsed(normalizedKey, user.user_id);

  queuePendingActivation({
    userId: user.user_id,
    username: user.username,
    serialKey: normalizedKey,
    activatedAt: new Date().toISOString(),
  });

  const token = randomUUID();
  rememberSession({
    token,
    userId: user.user_id,
    role: "user",
    expiresAt: Date.now() + USER_SESSION_MS,
  });

  void deviceService.syncClientDevicesForUser(user.user_id, normalizedUsername);
  setImmediate(() => {
    void syncPendingOnlineActivations();
  });

  return { success: true, userId: user.user_id, token, role: "user" as const };
}

const OFFLINE_ACTIVATION_TIMEOUT_MS = 6_000;
const ACTIVATION_RACE_TIMEOUT_MS = 10_000;

function withActivationTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T) {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]);
}

async function raceActivationAttempts(
  normalizedKey: string,
  normalizedUsername: string,
): Promise<
  | { source: "online"; data: SyncedUserAccount & { passwordHash?: string; serialKey?: string | null } }
  | { source: "offline"; result: ActivateKeyResult & { success: true } }
  | { source: "failed"; onlineError: string; offlineError: string }
> {
  return new Promise((resolve) => {
    let settled = false;
    let onlineError = "Could not reach the online API";
    let offlineError = "Activation failed";

    const finish = (
      outcome:
        | { source: "online"; data: SyncedUserAccount & { passwordHash?: string; serialKey?: string | null } }
        | { source: "offline"; result: ActivateKeyResult & { success: true } }
        | { source: "failed"; onlineError: string; offlineError: string },
    ) => {
      if (settled) return;
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

    const offlinePromise = withActivationTimeout(
      tryOfflineActivation(normalizedKey, normalizedUsername).catch(
        () => ({ success: false as const, error: "Offline activation failed" }),
      ),
      OFFLINE_ACTIVATION_TIMEOUT_MS,
      { success: false as const, error: "Offline activation timed out" },
    );

    const onlinePromise = (async () => {
      const gatewayUp = await probeGatewayHealth(getGatewayApiUrl(), 400);
      if (!gatewayUp) {
        return { success: false as const, error: "Could not reach the online API" };
      }

      return activateUserAccountOnline({
        serialKey: normalizedKey,
        username: normalizedUsername,
      });
    })().catch(() => ({ success: false as const, error: "Could not reach the online API" }));

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
      if (settled) return;

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

async function findLocalUserByUsername(username: string) {
  return queryOne<{
    user_id: number;
    password_hash: string;
    account_status: string;
    role_id: number;
  }>(
    `SELECT user_id, password_hash, account_status, role_id
     FROM users
     WHERE LOWER(username) = LOWER($1)
       AND deleted_at IS NULL`,
    [username],
  );
}

export const authService = {
  initStores(userDataPath: string) {
    initOnlineAuthStore(userDataPath);
    initPendingActivationStore(userDataPath);
  },

  restorePersistedSessions() {
    purgeExpiredSessions();
    for (const session of loadStoredSessions()) {
      if (session.expiresAt > Date.now()) {
        sessions.set(session.token, session);
      }
    }
    restoreOnlineAuthForSessions();
  },

  async login(username: string, password: string) {
    const normalizedUsername = username.trim();
    const lock = failedAttempts.get(normalizedUsername);
    if (lock?.lockedUntil && lock.lockedUntil > Date.now()) {
      return buildLockedLoginResponse(lock);
    }
    if (lock?.lockedUntil && lock.lockedUntil <= Date.now()) {
      failedAttempts.set(normalizedUsername, {
        count: 0,
        lockedUntil: 0,
        lockTier: lock.lockTier,
      });
    }

    let user = await findLocalUserByUsername(normalizedUsername);

    if (user) {
      if (user.account_status !== "active") {
        return { success: false, error: NOT_ACTIVATED_ERROR };
      }

      let valid = await hashService.verifyPassword(user.password_hash, password);
      if (!valid && (await ensureGatewayReachable())) {
        const refreshed = await refreshLocalUserFromOnline(normalizedUsername, password);
        if (refreshed.synced.success && refreshed.user) {
          user = refreshed.user;
          valid = await hashService.verifyPassword(user.password_hash, password);
        } else if (
          refreshed.synced.error &&
          !isInvalidCredentialsMessage(refreshed.synced.error) &&
          isOnlineUnavailableMessage(refreshed.synced.error)
        ) {
          return { success: false, error: NETWORK_LOGIN_ERROR };
        }
      }

      if (!valid) return bumpFail(normalizedUsername, "Invalid credentials");

      failedAttempts.delete(normalizedUsername);
      const token = createUserSession(user.user_id);
      const loggedInUserId = user.user_id;

      await query(
        "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
        [loggedInUserId, "login", JSON.stringify({ method: "password" })],
      );

      void syncUserFromOnline(normalizedUsername, password);
      void authenticateOnline(loggedInUserId, normalizedUsername, password).then(async (online) => {
        if (online) {
          await resolveAccountContext(loggedInUserId, normalizedUsername);
          await syncPendingOnlineActivations();
        }
      });
      void deviceService.syncClientDevicesForUser(loggedInUserId, normalizedUsername);

      return { success: true, token, role: "user" as const, userId: loggedInUserId };
    }

    if (!(await ensureGatewayReachable())) {
      return { success: false, error: NETWORK_LOGIN_ERROR };
    }

    const synced = await syncUserFromOnline(normalizedUsername, password);
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

      const valid = await hashService.verifyPassword(user.password_hash, password);
      if (!valid) return bumpFail(normalizedUsername, "Invalid credentials");

      failedAttempts.delete(normalizedUsername);
      const token = createUserSession(user.user_id);

      await query(
        "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
        [user.user_id, "login", JSON.stringify({ method: "password", source: "online-sync" })],
      );

      void authenticateOnline(user.user_id, normalizedUsername, password);
      void deviceService.syncClientDevicesForUser(user.user_id, normalizedUsername);

      return { success: true, token, role: "user" as const, userId: user.user_id };
    }

    if (synced.error === NOT_ACTIVATED_ERROR) {
      return { success: false, error: NOT_ACTIVATED_ERROR };
    }

    if (synced.error && isOnlineUnavailableMessage(synced.error)) {
      return { success: false, error: NETWORK_LOGIN_ERROR };
    }

    if (synced.error && !isInvalidCredentialsMessage(synced.error)) {
      return { success: false, error: synced.error };
    }

    return bumpFail(normalizedUsername, "Invalid credentials");
  },

  async logout(token: string) {
    await devicePresenceService.stop();
    forgetSession(token);
    setOnlineAccessToken(null);
    clearOnlineAuth();
    return { success: true };
  },

  async activateKey(serialKey: string, username: string) {
    try {
      const normalizedUsername = username.trim();
      const normalizedKey = serialKey.trim();

      if (!keysService.validateFormat(normalizedKey)) {
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Activation failed",
      };
    }
  },

  async checkSession(token: string) {
    purgeExpiredSessions();

    let session = sessions.get(token);
    if (!session) {
      for (const stored of loadStoredSessions()) {
        if (stored.token === token && stored.expiresAt > Date.now()) {
          session = stored;
          sessions.set(stored.token, stored);
          break;
        }
      }
    }

    if (!session) return { valid: false, remainingMs: 0 };
    const remainingMs = session.expiresAt - Date.now();
    if (remainingMs <= 0) {
      forgetSession(token);
      return { valid: false, remainingMs: 0 };
    }

    const user = await queryOne<{ account_status: string }>(
      `SELECT account_status
       FROM users
       WHERE user_id = $1
         AND deleted_at IS NULL`,
      [session.userId],
    );

    if (!user || user.account_status === "deleted") {
      forgetSession(token);
      return { valid: false, remainingMs: 0 };
    }

    session.expiresAt = Date.now() + USER_SESSION_MS;
    rememberSession(session);
    return { valid: true, remainingMs: session.expiresAt - Date.now() };
  },

  getSession(token: string) {
    return sessions.get(token) ?? null;
  },

  async requestRecovery(payload: {
    channel: "email" | "sms";
    username?: string;
    context?: string;
  }) {
    const result = await submitUserRecoveryOnline(payload);
    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    await query(
      "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
      [null, "recovery_requested", JSON.stringify({ channel: payload.channel, context: payload.context ?? null })],
    );

    return { success: true as const, requestId: result.data.requestId as string };
  },

  async getProfile(token: string) {
    const session = sessions.get(token);
    if (!session) return { success: false as const, error: "Session expired" };

    const user = await queryOne<{
      user_id: number;
      username: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phone_number: string | null;
      company: string | null;
      department: string | null;
      serial_key: string | null;
      account_status: string;
      contact_saved_by_user: boolean | null;
    }>(
      `SELECT user_id, username, first_name, last_name, email, phone_number, company, department,
              serial_key, account_status, contact_saved_by_user
       FROM users
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [session.userId],
    );

    if (!user) return { success: false as const, error: "Account not found" };

    const accountContext = await resolveAccountContext(session.userId, user.username);
    const { adminContact } = accountContext;

    let company = user.company?.trim() || accountContext.company?.trim() || null;
    let department = user.department?.trim() || accountContext.department?.trim() || null;

    if (company !== user.company || department !== user.department) {
      await query(
        `UPDATE users SET company = $1, department = $2, updated_at = NOW() WHERE user_id = $3`,
        [company, department, session.userId],
      );
    }

    let { email, phoneNumber } = sanitizeUserContactFields(
      user.email,
      user.phone_number,
      adminContact,
    );

    let contactSavedByUser = Boolean(user.contact_saved_by_user);
    if (!contactSavedByUser && (email || phoneNumber)) {
      contactSavedByUser = true;
    }
    if (!contactSavedByUser) {
      email = null;
      phoneNumber = null;
    }

    const dbUpdates: string[] = [];
    const dbParams: unknown[] = [];
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
      await query(
        `UPDATE users SET ${dbUpdates.join(", ")}, updated_at = NOW() WHERE user_id = $${paramIndex}`,
        dbParams,
      );
    }

    return {
      success: true as const,
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

  async updateProfile(
    token: string,
    payload: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
    },
  ) {
    const session = sessions.get(token);
    if (!session) return { success: false as const, error: "Session expired" };

    const accountContext = await loadLocalAccountContext(session.userId);
    const sanitized = sanitizeUserContactFields(
      payload.email,
      payload.phoneNumber,
      accountContext.adminContact,
    );
    const savingContact = payload.email !== undefined || payload.phoneNumber !== undefined;
    const contactSavedByUser = savingContact
      ? Boolean(sanitized.email || sanitized.phoneNumber)
      : undefined;

    await query(
      `UPDATE users
       SET first_name = CASE WHEN $6 THEN $1 ELSE first_name END,
           last_name = CASE WHEN $7 THEN $2 ELSE last_name END,
           email = CASE WHEN $8 THEN $3 ELSE email END,
           phone_number = CASE WHEN $9 THEN $4 ELSE phone_number END,
           contact_saved_by_user = CASE
             WHEN $10 THEN $5
             ELSE contact_saved_by_user
           END,
           updated_at = NOW()
       WHERE user_id = $11`,
      [
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
      ],
    );

    void updateUserProfileOnline({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: sanitized.email ?? undefined,
      phoneNumber: sanitized.phoneNumber ?? undefined,
    });

    return this.getProfile(token);
  },

  async changePassword(token: string, currentPassword: string, newPassword: string) {
    const session = sessions.get(token);
    if (!session) return { success: false as const, error: "Session expired" };

    const user = await queryOne<{ password_hash: string }>(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [session.userId],
    );
    if (!user) return { success: false as const, error: "Account not found" };

    const valid = await hashService.verifyPassword(user.password_hash, currentPassword);
    if (!valid) return { success: false as const, error: "Current password is incorrect" };

    const nextHash = await hashService.hashPassword(newPassword);
    await query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2", [
      nextHash,
      session.userId,
    ]);

    void changeUserPasswordOnline(currentPassword, newPassword);

    return { success: true as const };
  },

  async getSupportContact(token: string, username?: string, serialKey?: string) {
    const normalizedUsername = username?.trim() || undefined;
    const normalizedSerialKey = serialKey?.trim() || undefined;
    const emptyContact = {
      adminName: null as string | null,
      email: null as string | null,
      phoneNumber: null as string | null,
    };

    const hasContact = (contact: {
      adminName?: string | null;
      email?: string | null;
      phoneNumber?: string | null;
    }) =>
      Boolean(
        contact.adminName?.trim() || contact.email?.trim() || contact.phoneNumber?.trim(),
      );

    const publicOnline = await fetchPublicSupportContactOnline({
      username: normalizedUsername,
      serialKey: normalizedSerialKey,
    });
    if (publicOnline.success && publicOnline.contact && hasContact(publicOnline.contact)) {
      if (normalizedUsername) {
        const user = await queryOne<{ user_id: number }>(
          "SELECT user_id FROM users WHERE LOWER(username) = LOWER($1)",
          [normalizedUsername],
        );
        if (user) {
          rememberSupportContact(user.user_id, normalizedUsername, publicOnline.contact);
        } else {
          saveSupportContact(0, {
            username: normalizedUsername,
            adminName: publicOnline.contact.adminName ?? null,
            email: publicOnline.contact.email ?? null,
            phoneNumber: publicOnline.contact.phoneNumber ?? null,
          });
        }
      }
      return { success: true as const, contact: publicOnline.contact };
    }

    if (normalizedUsername) {
      const localByUsername = await queryOne<{
        user_id: number;
        admin_contact_name: string | null;
        admin_contact_email: string | null;
        admin_contact_phone: string | null;
      }>(
        `SELECT user_id, admin_contact_name, admin_contact_email, admin_contact_phone
         FROM users
         WHERE LOWER(username) = LOWER($1)`,
        [normalizedUsername],
      );
      if (localByUsername) {
        const contact = {
          adminName: localByUsername.admin_contact_name?.trim() || null,
          email: localByUsername.admin_contact_email?.trim() || null,
          phoneNumber: localByUsername.admin_contact_phone?.trim() || null,
        };
        if (hasContact(contact)) {
          rememberSupportContact(localByUsername.user_id, normalizedUsername, contact);
          return { success: true as const, contact };
        }
      }
    }

    if (normalizedSerialKey) {
      const localBySerial = await queryOne<{
        user_id: number;
        username: string;
        admin_contact_name: string | null;
        admin_contact_email: string | null;
        admin_contact_phone: string | null;
      }>(
        `SELECT u.user_id, u.username, u.admin_contact_name, u.admin_contact_email, u.admin_contact_phone
         FROM users u
         WHERE LOWER(COALESCE(u.serial_key, '')) = LOWER($1)
            OR EXISTS (
              SELECT 1
              FROM serial_keys sk
              WHERE sk.assigned_to = u.user_id
                AND LOWER(sk.serial_key) = LOWER($1)
            )
         ORDER BY u.user_id ASC
         LIMIT 1`,
        [normalizedSerialKey],
      );
      if (localBySerial) {
        const contact = {
          adminName: localBySerial.admin_contact_name?.trim() || null,
          email: localBySerial.admin_contact_email?.trim() || null,
          phoneNumber: localBySerial.admin_contact_phone?.trim() || null,
        };
        if (hasContact(contact)) {
          rememberSupportContact(localBySerial.user_id, localBySerial.username, contact);
          return { success: true as const, contact };
        }
      }
    }

    const session = token ? sessions.get(token) : undefined;

    if (session) {
      const online = await fetchUserSupportContactOnline();
      if (online.success && online.contact && hasContact(online.contact)) {
        const user = await queryOne<{ username: string }>(
          "SELECT username FROM users WHERE user_id = $1",
          [session.userId],
        );
        rememberSupportContact(session.userId, user?.username ?? normalizedUsername ?? "", online.contact);
        return { success: true as const, contact: online.contact };
      }

      const localContext = await loadLocalAccountContext(session.userId);
      if (hasContact(localContext.adminContact)) {
        return { success: true as const, contact: localContext.adminContact };
      }
    }

    const cached =
      (session ? loadSupportContact(session.userId) : null) ??
      (normalizedUsername ? loadSupportContact(undefined, normalizedUsername) : loadSupportContact());

    if (cached && hasContact(cached)) {
      return {
        success: true as const,
        contact: {
          adminName: cached.adminName,
          email: cached.email,
          phoneNumber: cached.phoneNumber,
        },
      };
    }

    return {
      success: true as const,
      contact: emptyContact,
    };
  },

  async syncPendingActivations() {
    await syncPendingOnlineActivations();
    return { success: true as const };
  },
};

function loginLockDurationMs(lockTier: number) {
  return LOGIN_LOCK_DURATIONS_MS[
    Math.min(Math.max(lockTier, 0), LOGIN_LOCK_DURATIONS_MS.length - 1)
  ];
}

function buildLockedLoginResponse(lock: FailedLoginState) {
  const lockSecondsRemaining = Math.max(1, Math.ceil((lock.lockedUntil - Date.now()) / 1000));
  return {
    success: false as const,
    error: `Account locked. Try again in ${lockSecondsRemaining} seconds.`,
    attemptsRemaining: 0,
    lockedUntil: lock.lockedUntil,
    lockSecondsRemaining,
  };
}

function bumpFail(username: string, error: string) {
  const normalizedUsername = username.trim();
  const now = Date.now();
  const prev = failedAttempts.get(normalizedUsername) ?? {
    count: 0,
    lockedUntil: 0,
    lockTier: 0,
  };

  if (prev.lockedUntil > now) {
    return buildLockedLoginResponse(prev);
  }

  const count = prev.count + 1;
  if (count >= MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = now + loginLockDurationMs(prev.lockTier);
    const next: FailedLoginState = {
      count: 0,
      lockedUntil,
      lockTier: prev.lockTier + 1,
    };
    failedAttempts.set(normalizedUsername, next);
    return buildLockedLoginResponse(next);
  }

  failedAttempts.set(normalizedUsername, {
    count,
    lockedUntil: 0,
    lockTier: prev.lockTier,
  });

  return {
    success: false as const,
    error,
    attemptsRemaining: MAX_LOGIN_ATTEMPTS - count,
  };
}
