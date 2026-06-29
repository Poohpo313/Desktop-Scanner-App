import { Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminUsersService {
  /** Lists all users across every admin scope. */
  async listAll(): Promise<Array<{ id: string; username: string }>> {
    return [{ id: 'user-1', username: 'global-user' }];
  }

  /** Accepts or rejects cloud verification for a user. */
  async setCloudVerification(userId: string, approved: boolean): Promise<{ userId: string; approved: boolean }> {
    return { userId, approved };
  }
}
