import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

type ActivityLogRecord = {
  log_id: number;
  action: string;
  details: Record<string, unknown> | null;
  timestamp: Date;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource
  ) {}

  async list() {
    const rows = (await this.db.query(`
      SELECT
        al.log_id,
        al.action,
        al.details,
        al.timestamp,
        u.username,
        u.first_name,
        u.last_name,
        u.email
      FROM activity_logs al
      LEFT JOIN users u ON u.user_id = al.user_id
      ORDER BY al.timestamp DESC
    `)) as ActivityLogRecord[];

    return rows.map((row) => ({
      id: String(row.log_id),
      action: row.action,
      details: row.details,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
      username: row.username ?? undefined,
      firstName: row.first_name ?? undefined,
      lastName: row.last_name ?? undefined,
      email: row.email ?? undefined,
    }));
  }
}
