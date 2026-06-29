import {
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
import type { JwtPayload, LoginResponse, UserRole } from "../../shared/types";
import { sha256FromString } from "../../shared/utils/sha256.util";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { AdminsService } from "../admins/admins.service";
import { UsersService } from "../users/users.service";

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
    if (role === "admin") return "15m";
    return "15m";
  }

  private signAccessToken(sub: number, username: string, role: UserRole): string {
    const payload: JwtPayload = { sub, username, role };
    const expiresIn = this.sessionExpiry(role);
    return this.jwt.sign(payload, {
      secret: this.config.get<string>("JWT_SECRET"),
      expiresIn: expiresIn as `${number}m`
    });
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
      accessToken: this.signAccessToken(admin.adminId, admin.username, role),
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
        accessToken: this.signAccessToken(admin.adminId, admin.username, "admin"),
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
}
