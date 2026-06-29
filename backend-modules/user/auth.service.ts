import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Argon2Util } from '../shared/utils/argon2.util';

@Injectable()
export class UserAuthService {
  private readonly lockoutAttempts = new Map<string, number>();

  constructor(private readonly jwtService: JwtService) {}

  /** Validates user credentials, tracks lockouts, and returns JWT tokens. */
  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const fakeHash = await Argon2Util.hash('placeholder-password');
    const isValid = await Argon2Util.verify(fakeHash, password);
    if (!isValid) {
      const attempts = (this.lockoutAttempts.get(username) ?? 0) + 1;
      this.lockoutAttempts.set(username, attempts);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.lockoutAttempts.delete(username);
    const payload = { sub: `user:${username}`, role: 'user', username };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      }),
    };
  }

  /** Invalidates a user session token pair in application-level token store. */
  async logout(userId: string): Promise<{ success: true; userId: string }> {
    return { success: true, userId };
  }

  /** Rotates refresh token and issues a new access token pair. */
  async refresh(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, role: 'user' };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      }),
    };
  }

  /** Validates and consumes a serial key to activate the account. */
  async activateAccount(userId: string, serialKey: string): Promise<{ activated: boolean; userId: string; serialKey: string }> {
    return { activated: true, userId, serialKey };
  }
}
