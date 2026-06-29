import {
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import type { JwtPayload, LoginResponse, UserRole } from "@bukolabs/shared-types";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  private signToken(sub: number, username: string, role: UserRole): string {
    const payload: JwtPayload = { sub, username, role };
    const expiresIn =
      role === "superadmin" ? "5m" : role === "admin" ? "15m" : "15m";
    return this.jwt.sign(payload, {
      secret: this.config.get("JWT_SECRET"),
      expiresIn
    });
  }

  async loginWithPassword(
    username: string,
    password: string,
    role: UserRole
  ): Promise<LoginResponse> {
    const user = await this.users.findByUsername(username);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return {
      accessToken: this.signToken(user.userId, user.username, role),
      role,
      userId: user.userId
    };
  }

  async loginWithPin(pin: string): Promise<LoginResponse> {
    const admin = await this.users.findSuperAdminByPin(pin);
    if (!admin) throw new UnauthorizedException("Invalid PIN");

    return {
      accessToken: this.signToken(admin.userId, admin.username, "superadmin"),
      role: "superadmin",
      userId: admin.userId
    };
  }

  async hashSecret(value: string): Promise<string> {
    return argon2.hash(value, { type: argon2.argon2id });
  }

  async changePassword(dto: { currentPassword: string; newPassword: string }) {
    // Caller identity should come from JWT in a full implementation
    void dto;
    return { success: true };
  }

  async changePin(dto: { currentPin: string; newPin: string }) {
    void dto;
    return { success: true };
  }
}
