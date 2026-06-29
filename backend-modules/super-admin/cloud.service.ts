import { Injectable } from '@nestjs/common';

/** Placeholder — future Google Cloud Bucket (or similar) integration. Not the online database. */
@Injectable()
export class CloudService {
  private readonly notConfigured = {
    status: 'not_configured' as const,
    message: 'Cloud storage integration is planned but not implemented yet.',
  };

  storage() {
    return { ...this.notConfigured, totalGb: 0, usedGb: 0, percent: 0, perUser: [] };
  }

  verificationList() {
    return [];
  }

  verify(id: string) {
    return { id, ...this.notConfigured };
  }

  reject(id: string) {
    return { id, ...this.notConfigured };
  }

  syncUser(userId: number) {
    return { userId, ...this.notConfigured };
  }
}
