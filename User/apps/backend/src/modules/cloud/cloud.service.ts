import { Injectable } from "@nestjs/common";

type VerificationRequest = {
  userId: number;
  username: string;
  email?: string;
  requestedAt: string;
};

@Injectable()
export class CloudService {
  private verifications: VerificationRequest[] = [
    {
      userId: 1,
      username: "demo",
      email: "demo@bukolabs.io",
      requestedAt: new Date().toISOString()
    }
  ];

  storage() {
    return {
      totalGb: 100,
      usedGb: 12.4,
      percent: 12,
      perUser: [
        { userId: 1, username: "demo", usedGb: 4.2, quotaGb: 10 },
        { userId: 2, username: "user2", usedGb: 8.2, quotaGb: 10 }
      ]
    };
  }

  verificationList() {
    return this.verifications;
  }

  verify(id: string) {
    const userId = Number(id);
    this.verifications = this.verifications.filter((v) => v.userId !== userId);
    return { id, status: "verified" };
  }

  reject(id: string) {
    const userId = Number(id);
    this.verifications = this.verifications.filter((v) => v.userId !== userId);
    return { id, status: "rejected" };
  }

  syncUser(userId: number) {
    return { userId, status: "sync_started" };
  }
}
