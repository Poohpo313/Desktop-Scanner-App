import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectDataSource } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { randomBytes } from "crypto";
import { DataSource } from "typeorm";
import type {
  AdminRecoveryDto,
  SuperAdminRecoveryDto,
  UserRecoveryDto
} from "./dto/recovery.dto";
import type { JwtPayload, LoginResponse, UserRole } from "../../shared/types";
import { sha256FromString } from "../../shared/utils/sha256.util";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { AdminsService } from "../admins/admins.service";
import { UsersService } from "../users/users.service";

export type RecoveryStatusPhase =
  | "under-review"
  | "identity-verification"
  | "credentials-released";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly admins: AdminsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly activityLog: ActivityLogService,
    @InjectDataSource("online")
    private readonly db: DataSource
  ) {}

  private sessionExpiry(role: UserRole): string {
    if (role === "superadmin") return "5m";
    if (role === "admin") return "8h";
    return "15m";
  }

  private signAccessToken(
    sub: number,
    username: string,
    role: UserRole,
    adminScope?: { company?: string | null; department?: string | null },
  ): string {
    const payload: JwtPayload = { sub, username, role };
    if (role === "admin" && adminScope?.company?.trim()) {
      payload.company = adminScope.company.trim();
      payload.department = adminScope.department?.trim() || undefined;
    }
    const expiresIn = this.sessionExpiry(role);
    return this.jwt.sign(payload, {
      secret: this.config.get<string>("JWT_SECRET"),
      expiresIn: expiresIn as `${number}m`
    });
  }

  private adminTokenScope(admin: {
    company?: string | null;
    department?: string | null;
    departments?: string[] | null;
  }) {
    const primary =
      admin.department?.trim() ||
      (Array.isArray(admin.departments)
        ? admin.departments.map((value) => value?.trim()).find(Boolean)
        : undefined);
    return {
      company: admin.company,
      department: primary ?? null,
    };
  }

  private async createRefreshToken(
    accountType: "user" | "admin",
    accountId: number
  ): Promise<string> {
    const raw = randomBytes(48).toString("hex");
    const tokenHash = sha256FromString(raw);
    const expiresDays = Number(this.config.get("JWT_REFRESH_EXPIRES_DAYS") ?? 7);
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    await this.db.query(
      `INSERT INTO refresh_tokens (account_type, account_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [accountType, accountId, tokenHash, expiresAt]
    );

    return raw;
  }

  async revokeRefreshToken(rawToken: string) {
    if (!rawToken) return;
    const tokenHash = sha256FromString(rawToken);
    await this.db.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [
      tokenHash
    ]);
  }

  async refreshSession(rawToken: string): Promise<LoginResponse & { refreshToken: string }> {
    if (!rawToken) throw new UnauthorizedException("Missing refresh token");

    const tokenHash = sha256FromString(rawToken);
    const rows = (await this.db.query(
      `SELECT account_type, account_id, expires_at
       FROM refresh_tokens WHERE token_hash = $1`,
      [tokenHash]
    )) as Array<{ account_type: string; account_id: number; expires_at: Date }>;

    const record = rows[0];
    if (!record || new Date(record.expires_at) < new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }

    await this.revokeRefreshToken(rawToken);

    if (record.account_type === "user") {
      const user = await this.users.findById(record.account_id);
      if (!user || user.accountStatus === "deleted") {
        throw new UnauthorizedException("Account unavailable");
      }
      const refreshToken = await this.createRefreshToken("user", user.userId);
      return {
        accessToken: this.signAccessToken(user.userId, user.username, "user"),
        role: "user",
        userId: user.userId,
        refreshToken
      };
    }

    const admin = await this.admins.findById(record.account_id);
    if (!admin || admin.accountStatus === "deleted") {
      throw new UnauthorizedException("Account unavailable");
    }
    const role = await this.admins.resolveRoleName(admin.roleId);
    if (role !== "admin" && role !== "superadmin") {
      throw new UnauthorizedException("Invalid account role");
    }
    const refreshToken = await this.createRefreshToken("admin", admin.adminId);
      return {
        accessToken: this.signAccessToken(admin.adminId, admin.username, role, this.adminTokenScope(admin)),
        role,
        userId: admin.adminId,
        refreshToken
      };
  }

  private assertNotLocked(lockedUntil?: Date | null) {
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
      throw new ForbiddenException("Account locked due to failed login attempts");
    }
  }

  async loginWithPassword(
    username: string,
    password: string,
    role: UserRole
  ): Promise<LoginResponse & { refreshToken: string }> {
    if (role === "admin") {
      const admin = await this.admins.findByUsername(username);
      if (!admin) throw new UnauthorizedException("Invalid credentials");
      this.assertNotLocked(admin.lockedUntil);

      const adminRole = await this.admins.resolveRoleName(admin.roleId);
      if (adminRole !== "admin") throw new UnauthorizedException("Invalid credentials");

      const valid = await argon2.verify(admin.passwordHash, password);
      if (!valid) {
        await this.admins.recordFailedLogin(admin.adminId);
        throw new UnauthorizedException("Invalid credentials");
      }

      await this.admins.resetFailedLogin(admin.adminId);
      const refreshToken = await this.createRefreshToken("admin", admin.adminId);
      await this.activityLog.log("admin.login", { username }, { adminId: admin.adminId });

      return {
        accessToken: this.signAccessToken(admin.adminId, admin.username, "admin", this.adminTokenScope(admin)),
        role: "admin",
        userId: admin.adminId,
        refreshToken
      };
    }

    const user = await this.users.findByUsername(username);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    this.assertNotLocked(user.lockedUntil);

    const userRole = await this.users.resolveRoleName(user.roleId);
    if (userRole !== "user") throw new UnauthorizedException("Invalid credentials");

    if (user.accountStatus !== "active") {
      throw new UnauthorizedException(
        "Account not Activated : Activate account first to access"
      );
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      await this.users.recordFailedLogin(user.userId);
      throw new UnauthorizedException("Invalid credentials");
    }

    await this.users.resetFailedLogin(user.userId);
    const refreshToken = await this.createRefreshToken("user", user.userId);
    await this.activityLog.log("user.login", { username }, { userId: user.userId });

    return {
      accessToken: this.signAccessToken(user.userId, user.username, "user"),
      role: "user",
      userId: user.userId,
      refreshToken
    };
  }

  async loginWithPin(pin: string): Promise<LoginResponse & { refreshToken: string }> {
    const admin = await this.admins.findSuperAdminByPin(pin);
    if (!admin) throw new UnauthorizedException("Invalid PIN");

    this.assertNotLocked(admin.lockedUntil);

    await this.admins.resetFailedLogin(admin.adminId);
    const refreshToken = await this.createRefreshToken("admin", admin.adminId);
    await this.activityLog.log("superadmin.login", {}, { adminId: admin.adminId });

    return {
      accessToken: this.signAccessToken(admin.adminId, admin.username, "superadmin"),
      role: "superadmin",
      userId: admin.adminId,
      refreshToken
    };
  }

  async changePassword(
    adminId: number,
    dto: { currentPassword: string; newPassword: string }
  ) {
    const admin = await this.admins.findById(adminId);
    if (!admin) throw new UnauthorizedException("Account not found");

    const valid = await argon2.verify(admin.passwordHash, dto.currentPassword);
    if (!valid) throw new UnauthorizedException("Current password is incorrect");

    await this.admins.updatePassword(
      adminId,
      await argon2.hash(dto.newPassword, { type: argon2.argon2id })
    );
    await this.activityLog.log("admin.password_changed", {}, { adminId });
    return { success: true };
  }

  async updateProfile(
    user: JwtPayload & { userId?: number },
    dto: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
    }
  ) {
    const accountId = user.userId ?? user.sub;

    if (user.role === "user") {
      throw new UnauthorizedException("Profile updates are not available for this account");
    }

    const admin = await this.admins.findById(accountId);
    if (!admin || admin.accountStatus === "deleted") {
      throw new UnauthorizedException("Account unavailable");
    }

    if (dto.email?.trim()) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      const emailRows = (await this.db.query(
        `SELECT admin_id
         FROM admins
         WHERE LOWER(email) = $1
           AND admin_id <> $2
           AND account_status <> 'deleted'
         LIMIT 1`,
        [normalizedEmail, accountId]
      )) as Array<{ admin_id: number }>;

      if (emailRows[0]?.admin_id) {
        throw new BadRequestException("Email already registered to another administrator");
      }
    }

    const updated = await this.admins.update(accountId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
    });

    await this.activityLog.log("admin.profile_updated", {}, { adminId: accountId });

    const role = await this.admins.resolveRoleName(updated?.roleId);

    return {
      userId: updated?.adminId ?? accountId,
      username: updated?.username ?? admin.username,
      role: role ?? user.role,
      firstName: updated?.firstName ?? null,
      lastName: updated?.lastName ?? null,
      email: updated?.email ?? null,
      phoneNumber: updated?.phoneNumber ?? null,
      company: updated?.company ?? null,
      department: updated?.department ?? null,
    };
  }

  async updateUserProfile(
    userId: number,
    dto: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
    }
  ) {
    const updated = await this.users.update(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
    });

    await this.activityLog.log("user.profile_updated", { userId }, { userId });

    return {
      userId: updated.userId,
      username: updated.username,
      firstName: updated.firstName ?? null,
      lastName: updated.lastName ?? null,
      email: updated.email ?? null,
      phoneNumber: updated.phoneNumber ?? null,
      company: updated.company ?? null,
      department: updated.department ?? null,
      accountStatus: updated.accountStatus,
    };
  }

  async changeUserPassword(
    userId: number,
    dto: { currentPassword: string; newPassword: string }
  ) {
    const user = await this.users.findById(userId);
    if (!user || user.accountStatus === "deleted") {
      throw new UnauthorizedException("Account not found");
    }

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) throw new UnauthorizedException("Current password is incorrect");

    await this.users.update(userId, { password: dto.newPassword });
    await this.activityLog.log("user.password_changed", { userId }, { userId });
    return { success: true };
  }

  async changePin(
    adminId: number,
    dto: { currentPin: string; newPin: string }
  ) {
    const admin = await this.admins.findById(adminId);
    if (!admin?.pinHash) throw new UnauthorizedException("Account not found");

    const valid = await argon2.verify(admin.pinHash, dto.currentPin);
    if (!valid) throw new UnauthorizedException("Current PIN is incorrect");

    const pinHash = await argon2.hash(dto.newPin, { type: argon2.argon2id });
    await this.admins.updatePin(adminId, pinHash);
    await this.activityLog.log("superadmin.pin_changed", {}, { adminId });
    return { success: true };
  }

  async getProfile(user: JwtPayload & { userId?: number }) {
    const accountId = user.userId ?? user.sub;

    if (user.role === "user") {
      const account = await this.users.findById(accountId);
      if (!account || account.accountStatus === "deleted") {
        throw new UnauthorizedException("Account unavailable");
      }

      return {
        userId: account.userId,
        username: account.username,
        role: user.role,
        firstName: account.firstName ?? null,
        lastName: account.lastName ?? null,
        email: account.email ?? null,
      };
    }

    const admin = await this.admins.findById(accountId);
    if (!admin || admin.accountStatus === "deleted") {
      throw new UnauthorizedException("Account unavailable");
    }

    const role = await this.admins.resolveRoleName(admin.roleId);

    return {
      userId: admin.adminId,
      username: admin.username,
      role: role ?? user.role,
      firstName: admin.firstName ?? null,
      lastName: admin.lastName ?? null,
      email: admin.email ?? null,
      phoneNumber: admin.phoneNumber ?? null,
      company: admin.company ?? null,
      department: admin.department ?? null,
      departments: Array.isArray((admin as { departments?: string[] }).departments)
        ? (admin as { departments?: string[] }).departments ?? []
        : admin.department
          ? [admin.department]
          : [],
    };
  }

  private formatRequestId(id: number): string {
    const year = new Date().getFullYear();
    return `REC-${year}-${String(id).padStart(6, "0")}`;
  }

  private parseRequestId(raw: string): number | null {
    const trimmed = raw.trim();
    const prefixed = /^REC-\d{4}-(\d+)$/i.exec(trimmed);
    if (prefixed) return Number(prefixed[1]);

    const numeric = Number(trimmed);
    return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
  }

  mapRecoveryStatusToPhase(status: string): RecoveryStatusPhase {
    if (status === "identity_verification") return "identity-verification";
    if (status === "credentials_released") return "credentials-released";
    return "under-review";
  }

  private async createRecoveryRequest(params: {
    requestType: "admin" | "superadmin" | "user";
    channel: string;
    identifier: string;
    username?: string;
    metadata?: Record<string, unknown>;
  }) {
    const rows = (await this.db.query(
      `INSERT INTO recovery_requests (request_type, channel, identifier, username, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING request_id, status, created_at`,
      [
        params.requestType,
        params.channel,
        params.identifier.trim(),
        params.username?.trim() || null,
        JSON.stringify(params.metadata ?? {})
      ]
    )) as Array<{ request_id: number; status: string; created_at: string }>;

    const row = rows[0];
    if (!row) throw new UnauthorizedException("Failed to queue recovery request");

    await this.activityLog.log(`${params.requestType}.recovery_requested`, {
      requestId: row.request_id,
      channel: params.channel,
      identifier: params.identifier.trim()
    });

    return {
      requestId: this.formatRequestId(row.request_id),
      requestNumber: row.request_id,
      status: row.status,
      phase: this.mapRecoveryStatusToPhase(row.status),
      submittedAt: row.created_at
    };
  }

  submitAdminRecovery(dto: AdminRecoveryDto) {
    return this.createRecoveryRequest({
      requestType: "admin",
      channel: dto.channel,
      identifier: dto.identifier,
      username: dto.username
    });
  }

  submitSuperAdminRecovery(dto: SuperAdminRecoveryDto) {
    return this.createRecoveryRequest({
      requestType: "superadmin",
      channel: dto.channel,
      identifier: dto.identifier
    });
  }

  submitUserRecovery(dto: UserRecoveryDto) {
    return this.createRecoveryRequest({
      requestType: "user",
      channel: dto.channel,
      identifier: dto.username?.trim() || "user-portal",
      username: dto.username,
      metadata: dto.context ? { context: dto.context } : undefined
    });
  }

  async getRecoveryRequestStatus(rawRequestId: string) {
    const requestNumber = this.parseRequestId(rawRequestId);
    if (!requestNumber) throw new UnauthorizedException("Invalid recovery request id");

    const rows = (await this.db.query(
      `SELECT request_id, status, created_at, updated_at
       FROM recovery_requests WHERE request_id = $1`,
      [requestNumber]
    )) as Array<{
      request_id: number;
      status: string;
      created_at: string;
      updated_at: string;
    }>;

    const row = rows[0];
    if (!row) throw new UnauthorizedException("Recovery request not found");

    return {
      requestId: this.formatRequestId(row.request_id),
      requestNumber: row.request_id,
      status: row.status,
      phase: this.mapRecoveryStatusToPhase(row.status),
      submittedAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async activateUserAccount(dto: {
    serialKey: string;
    username: string;
  }) {
    const user = await this.users.findByUsernameIgnoreCase(dto.username);
    if (!user) throw new UnauthorizedException("Invalid username or serial key");

    if (user.accountStatus === "active") {
      throw new BadRequestException("Account is already activated");
    }

    const normalizedKey = dto.serialKey.trim();
    const keyRows = (await this.db.query(
      `SELECT serial_id, serial_key, status, assigned_to, expires_at, duration_days, company, department
       FROM serial_keys WHERE LOWER(serial_key) = LOWER($1)`,
      [normalizedKey]
    )) as Array<{
      serial_id: number;
      serial_key: string;
      status: string;
      assigned_to: number | null;
      expires_at: Date | null;
      duration_days: number | null;
      company: string | null;
      department: string | null;
    }>;

    const key = keyRows[0];
    if (!key) throw new BadRequestException("Invalid serial key");
    if (key.status !== "unused" && key.status !== "assigned") {
      throw new BadRequestException(`Serial key is ${key.status}`);
    }
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      throw new BadRequestException("Serial key has expired");
    }
    if (key.assigned_to && key.assigned_to !== user.userId) {
      throw new BadRequestException("Serial key is assigned to another user");
    }

    const userSerialKey = (user.serialKey ?? "").trim().toLowerCase();
    const normalizedStoredKey = key.serial_key.trim().toLowerCase();
    if (
      userSerialKey &&
      userSerialKey !== normalizedKey.toLowerCase() &&
      userSerialKey !== normalizedStoredKey &&
      key.assigned_to !== user.userId
    ) {
      throw new BadRequestException("Serial key does not match this account");
    }

    await this.db.query(
      `UPDATE users
       SET account_status = 'active',
           serial_key = $1,
           company = COALESCE(NULLIF(TRIM(company), ''), NULLIF(TRIM($3), '')),
           department = COALESCE(NULLIF(TRIM(department), ''), NULLIF(TRIM($4), '')),
           updated_at = NOW()
       WHERE user_id = $2`,
      [key.serial_key, user.userId, key.company ?? "", key.department ?? ""]
    );
    await this.db.query(
      `UPDATE serial_keys
       SET status = 'used',
           assigned_to = $1,
           used_at = NOW(),
           expires_at = COALESCE(
             expires_at,
             CASE
               WHEN duration_days IS NOT NULL AND duration_days > 0
                 THEN (NOW() + (duration_days::text || ' days')::interval)::timestamp
             END
           )
       WHERE serial_id = $2`,
      [user.userId, key.serial_id]
    );

    await this.activityLog.log(
      "user.activated",
      { serialKey: normalizedKey, username: user.username },
      { userId: user.userId }
    );

    return this.buildOfflineSyncPayload(user.userId, normalizedKey);
  }

  private sanitizeUserOwnedContact(
    email: string | null | undefined,
    phoneNumber: string | null | undefined,
    adminContact: { email?: string | null; phoneNumber?: string | null }
  ) {
    let nextEmail = email?.trim() || null;
    let nextPhone = phoneNumber?.trim() || null;
    const adminEmail = adminContact.email?.trim().toLowerCase();
    const adminPhone = adminContact.phoneNumber?.replace(/\D/g, "") ?? "";

    if (adminEmail && nextEmail?.toLowerCase() === adminEmail) {
      nextEmail = null;
    }

    if (adminPhone && nextPhone?.replace(/\D/g, "") === adminPhone) {
      nextPhone = null;
    }

    return { email: nextEmail, phoneNumber: nextPhone };
  }

  private async getAdminContactForUser(userId: number) {
    type AdminContactRow = {
      adminName: string | null;
      email: string | null;
      phoneNumber: string | null;
    };

    const selectAdmin = `
      SELECT
        NULLIF(TRIM(CONCAT(COALESCE(a.first_name, ''), ' ', COALESCE(a.last_name, ''))), '') AS "adminName",
        NULLIF(TRIM(a.email), '') AS email,
        NULLIF(TRIM(a.phone_number), '') AS "phoneNumber"
    `;

    const fromAssignedKey = (await this.db.query(
      `${selectAdmin}
       FROM serial_keys sk
       INNER JOIN admins a ON a.admin_id = sk.assigned_admin
       WHERE sk.assigned_to = $1
       ORDER BY sk.serial_id DESC
       LIMIT 1`,
      [userId]
    )) as AdminContactRow[];
    if (fromAssignedKey[0]?.email || fromAssignedKey[0]?.phoneNumber || fromAssignedKey[0]?.adminName) {
      return fromAssignedKey[0];
    }

    const fromUserSerialKey = (await this.db.query(
      `${selectAdmin}
       FROM users u
       INNER JOIN serial_keys sk ON LOWER(sk.serial_key) = LOWER(COALESCE(u.serial_key, ''))
       INNER JOIN admins a ON a.admin_id = sk.assigned_admin
       WHERE u.user_id = $1
         AND sk.assigned_admin IS NOT NULL
       ORDER BY sk.serial_id DESC
       LIMIT 1`,
      [userId]
    )) as AdminContactRow[];
    if (fromUserSerialKey[0]?.email || fromUserSerialKey[0]?.phoneNumber || fromUserSerialKey[0]?.adminName) {
      return fromUserSerialKey[0];
    }

    const fromSharedCompany = (await this.db.query(
      `${selectAdmin}
       FROM users u
       INNER JOIN admins a
         ON LOWER(TRIM(COALESCE(a.company, ''))) = LOWER(TRIM(COALESCE(u.company, '')))
       WHERE u.user_id = $1
         AND a.account_status = 'active'
         AND TRIM(COALESCE(u.company, '')) <> ''
       ORDER BY a.admin_id ASC
       LIMIT 1`,
      [userId]
    )) as AdminContactRow[];
    if (fromSharedCompany[0]?.email || fromSharedCompany[0]?.phoneNumber || fromSharedCompany[0]?.adminName) {
      return fromSharedCompany[0];
    }

    const fromKeyCompany = (await this.db.query(
      `${selectAdmin}
       FROM users u
       INNER JOIN serial_keys sk
         ON sk.assigned_to = u.user_id
         OR LOWER(sk.serial_key) = LOWER(COALESCE(u.serial_key, ''))
       INNER JOIN admins a
         ON LOWER(TRIM(COALESCE(a.company, ''))) = LOWER(TRIM(COALESCE(sk.company, u.company, '')))
       WHERE u.user_id = $1
         AND a.account_status = 'active'
         AND TRIM(COALESCE(sk.company, u.company, '')) <> ''
       ORDER BY sk.serial_id DESC, a.admin_id ASC
       LIMIT 1`,
      [userId]
    )) as AdminContactRow[];

    return fromKeyCompany[0] ?? { adminName: null, email: null, phoneNumber: null };
  }

  private async getAdminContactForSerialKey(serialKey: string) {
    type AdminContactRow = {
      adminName: string | null;
      email: string | null;
      phoneNumber: string | null;
    };

    const selectAdmin = `
      SELECT
        NULLIF(TRIM(CONCAT(COALESCE(a.first_name, ''), ' ', COALESCE(a.last_name, ''))), '') AS "adminName",
        NULLIF(TRIM(a.email), '') AS email,
        NULLIF(TRIM(a.phone_number), '') AS "phoneNumber"
    `;

    const fromAssignedAdmin = (await this.db.query(
      `${selectAdmin}
       FROM serial_keys sk
       INNER JOIN admins a ON a.admin_id = sk.assigned_admin
       WHERE LOWER(sk.serial_key) = LOWER($1)
       LIMIT 1`,
      [serialKey.trim()]
    )) as AdminContactRow[];
    if (
      fromAssignedAdmin[0]?.email ||
      fromAssignedAdmin[0]?.phoneNumber ||
      fromAssignedAdmin[0]?.adminName
    ) {
      return fromAssignedAdmin[0];
    }

    const fromAssignedUser = (await this.db.query(
      `${selectAdmin}
       FROM serial_keys sk
       INNER JOIN users u ON u.user_id = sk.assigned_to
       INNER JOIN admins a ON a.admin_id = sk.assigned_admin
       WHERE LOWER(sk.serial_key) = LOWER($1)
       LIMIT 1`,
      [serialKey.trim()]
    )) as AdminContactRow[];

    return fromAssignedUser[0] ?? { adminName: null, email: null, phoneNumber: null };
  }

  async getPublicSupportContact(params: { username?: string; serialKey?: string }) {
    const username = params.username?.trim();
    const serialKey = params.serialKey?.trim();

    if (username) {
      const user = await this.users.findByUsernameIgnoreCase(username);
      if (user) {
        const contact = await this.getUserSupportContact(user.userId);
        return {
          adminName: contact.adminName,
          email: contact.email,
          phoneNumber: contact.phoneNumber,
        };
      }
    }

    if (serialKey) {
      const contact = await this.getAdminContactForSerialKey(serialKey);
      if (contact.email || contact.phoneNumber || contact.adminName) {
        return contact;
      }
    }

    return { adminName: null, email: null, phoneNumber: null };
  }

  async getUserSupportContact(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) {
      return { adminName: null, email: null, phoneNumber: null, company: null, department: null };
    }

    const adminContact = await this.getAdminContactForUser(userId);
    const keyRows = (await this.db.query(
      `SELECT company, department
       FROM serial_keys
       WHERE assigned_to = $1
          OR LOWER(serial_key) = LOWER(COALESCE($2, ''))
       ORDER BY serial_id DESC
       LIMIT 1`,
      [userId, user.serialKey ?? ""]
    )) as Array<{ company: string | null; department: string | null }>;
    const keyMeta = keyRows[0];

    return {
      ...adminContact,
      company: user.company?.trim() || keyMeta?.company?.trim() || null,
      department: user.department?.trim() || keyMeta?.department?.trim() || null,
    };
  }

  private async buildOfflineSyncPayload(userId: number, serialKey: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException("Account unavailable");

    const keyRows = (await this.db.query(
      `SELECT serial_key, status, company, department, expires_at, duration_days, used_at, generated_at, trial
       FROM serial_keys
       WHERE assigned_to = $1 OR serial_key = $2
       ORDER BY serial_id DESC LIMIT 1`,
      [userId, serialKey]
    )) as Array<{
      serial_key: string;
      status: string;
      company: string | null;
      department: string | null;
      expires_at: Date | null;
      duration_days: number | null;
      used_at: Date | null;
      generated_at: Date;
      trial: boolean;
    }>;

    const adminContact = await this.getAdminContactForUser(userId);
    const ownedContact = this.sanitizeUserOwnedContact(
      user.email,
      user.phoneNumber,
      adminContact
    );

    if (
      ownedContact.email !== (user.email ?? null) ||
      ownedContact.phoneNumber !== (user.phoneNumber ?? null)
    ) {
      await this.users.update(userId, {
        email: ownedContact.email ?? "",
        phoneNumber: ownedContact.phoneNumber ?? "",
      });
    }

    return {
      userId: user.userId,
      username: user.username,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      email: ownedContact.email,
      phoneNumber: ownedContact.phoneNumber,
      department: user.department?.trim() || keyRows[0]?.department?.trim() || null,
      company: user.company?.trim() || keyRows[0]?.company?.trim() || null,
      accountStatus: user.accountStatus,
      serialKey: user.serialKey ?? keyRows[0]?.serial_key ?? serialKey,
      serialKeyStatus: keyRows[0]?.status ?? "used",
      keyExpiresAt: keyRows[0]?.expires_at ?? null,
      keyDurationDays: keyRows[0]?.duration_days ?? null,
      keyActivatedAt: keyRows[0]?.used_at ?? keyRows[0]?.generated_at ?? null,
      keyTrial: keyRows[0]?.trial ?? false,
      passwordHash: user.passwordHash,
      adminContact,
    };
  }

  async syncUserAccountForOffline(dto: { username: string; password: string }) {
    const user = await this.users.findByUsername(dto.username.trim());
    if (!user) throw new UnauthorizedException("Invalid credentials");

    if (user.accountStatus !== "active") {
      throw new UnauthorizedException(
        "Account not Activated : Activate account first to access"
      );
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const payload = await this.buildOfflineSyncPayload(user.userId, user.serialKey ?? "");
    return {
      ...payload,
      passwordHash: undefined,
    };
  }
}
