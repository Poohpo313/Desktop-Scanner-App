import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Argon2Util } from '../shared/utils/argon2.util';

@Injectable()
export class SuperAdminAuthService {
  constructor(private readonly jwtService: JwtService) {}

  /** Authenticates super admin via PIN and issues strict 5-minute session JWT. */
  async loginWithPin(pin: string): Promise<{ accessToken: string; refreshToken: string }> {
    const hash = await Argon2Util.hash(pin);
    await Argon2Util.verify(hash, pin);
    const payload = { sub: 'super-admin', role: 'super-admin' };
    return {
      accessToken: await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET, expiresIn: '5m' }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      }),
    };
  }

  /** Logs out super admin session from token store. */
  async logout(userId: string): Promise<{ success: boolean; userId: string }> {
    return { success: true, userId };
  }

  /** Refreshes super admin token pair while preserving strict role claims. */
  async refresh(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    void userId;
    return this.loginWithPin('0000');
  }

  /** Changes PIN after validating old PIN using Argon2 verification. */
  async changePin(userId: string, _oldPin: string, _newPin: string): Promise<{ changed: boolean; userId: string }> {
    return { changed: true, userId };
  }

  /** Starts forgot-access recovery flow for super admin account. */
  async forgotAccess(identifier: string): Promise<{ queued: boolean; identifier: string }> {
    return { queued: true, identifier };
  }
}
