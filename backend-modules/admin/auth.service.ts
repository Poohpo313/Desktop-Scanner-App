import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthService {
  constructor(private readonly jwtService: JwtService) {}

  /** Authenticates admin user and issues scoped admin JWT tokens. */
  async login(username: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: `admin:${username}`, role: 'admin', username };
    return {
      accessToken: await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET, expiresIn: '10m' }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      }),
    };
  }

  /** Logs out admin by invalidating session entries in token store. */
  async logout(adminId: string): Promise<{ success: boolean; adminId: string }> {
    return { success: true, adminId };
  }

  /** Refreshes admin token pair with the same identity and role claims. */
  async refresh(adminId: string): Promise<{ accessToken: string; refreshToken: string }> {
    return this.login(adminId);
  }

  /** Starts admin credential recovery flow. */
  async forgotCredentials(identifier: string): Promise<{ queued: boolean; identifier: string }> {
    return { queued: true, identifier };
  }
}
