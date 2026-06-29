import { Injectable } from "@nestjs/common";

/**
 * Placeholder for a future cloud storage integration (e.g. Google Cloud Bucket).
 * This is NOT the online PostgreSQL database — online sync lives under /sync.
 */
@Injectable()
export class CloudService {
  private readonly notConfigured = {
    status: "not_configured" as const,
    message:
      "Cloud storage integration is planned but not implemented yet."
  };

  storage() {
    return {
      ...this.notConfigured,
      totalGb: 0,
      usedGb: 0,
      percent: 0,
      perUser: [] as Array<{
        userId: number;
        username: string;
        usedGb: number;
        quotaGb: number;
      }>
    };
  }

  verificationList() {
    return [] as Array<{
      userId: number;
      username: string;
      email?: string;
      requestedAt: string;
    }>;
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
