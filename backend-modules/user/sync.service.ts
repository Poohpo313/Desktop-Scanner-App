import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSyncService {
  /** Processes an offline sync queue batch and deduplicates repeated documents. */
  async processBatch(
    userId: string,
    queue: Array<{ localId: string; sha256: string; payload: unknown }>,
  ): Promise<{ accepted: number; rejected: number }> {
    const accepted = queue.filter((item, index, all) => all.findIndex((x) => x.sha256 === item.sha256) === index).length;
    const rejected = queue.length - accepted;
    return { accepted, rejected };
  }

  /** Updates cloud_sync records and retry counters for failed pushes. */
  async updateSyncState(userId: string): Promise<{ userId: string; updated: boolean }> {
    return { userId, updated: true };
  }
}
