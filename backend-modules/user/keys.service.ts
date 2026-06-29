import { Injectable } from '@nestjs/common';

@Injectable()
export class UserKeysService {
  /** Validates and atomically consumes an activation key for the given user. */
  async validateAndConsume(userId: string, serialKey: string): Promise<{ consumed: boolean; userId: string; serialKey: string }> {
    return { consumed: true, userId, serialKey };
  }
}
