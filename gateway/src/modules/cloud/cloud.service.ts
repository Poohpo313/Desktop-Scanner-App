import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class CloudService {
  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource
  ) {}

  async storage() {
    const rows = (await this.db.query(`
      SELECT
        COALESCE(SUM(file_size), 0)::bigint AS used_bytes,
        COUNT(*)::int AS file_count
      FROM documents
      WHERE is_deleted = FALSE
    `)) as Array<{ used_bytes: string | number; file_count: number }>;

    const usedBytes = Number(rows[0]?.used_bytes ?? 0);
    const fileCount = Number(rows[0]?.file_count ?? 0);
    const quotaGb = 100;
    const usedGb = usedBytes / (1024 * 1024 * 1024);
    const percent = quotaGb > 0 ? Math.min(100, Math.round((usedGb / quotaGb) * 100)) : 0;

    const perUser = (await this.db.query(`
      SELECT
        u.user_id AS "userId",
        u.username,
        COALESCE(SUM(d.file_size), 0)::bigint AS used_bytes,
        COUNT(d.document_id)::int AS file_count
      FROM users u
      LEFT JOIN documents d ON d.uploaded_by = u.user_id AND d.is_deleted = FALSE
      INNER JOIN roles r ON r.role_id = u.role_id AND r.role_name = 'user'
      WHERE u.account_status <> 'deleted'
      GROUP BY u.user_id, u.username
      ORDER BY used_bytes DESC
    `)) as Array<{ userId: number; username: string; used_bytes: string | number; file_count: number }>;

    return {
      status: "active" as const,
      totalGb: quotaGb,
      usedGb: Number(usedGb.toFixed(2)),
      percent,
      fileCount,
      perUser: perUser.map((row) => ({
        userId: row.userId,
        username: row.username,
        usedGb: Number((Number(row.used_bytes) / (1024 * 1024 * 1024)).toFixed(2)),
        quotaGb,
        fileCount: row.file_count,
      })),
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
    return { id, status: "verified" as const };
  }

  reject(id: string) {
    return { id, status: "rejected" as const };
  }

  syncUser(userId: number) {
    return { userId, status: "queued" as const };
  }
}
