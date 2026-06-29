import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource } from "@nestjs/typeorm";
import { promises as fs } from "fs";
import * as path from "path";
import { DataSource } from "typeorm";

type ArchiveRow = {
  log_id: number;
  action: string;
  details: Record<string, unknown> | null;
  timestamp: Date | string;
  user_id: number | null;
  admin_id: number | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  admin_username?: string | null;
  admin_first_name?: string | null;
  admin_last_name?: string | null;
  admin_email?: string | null;
  role_name?: string | null;
};

@Injectable()
export class ActivityLogArchiveService {
  private readonly logger = new Logger(ActivityLogArchiveService.name);

  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource,
    private readonly config: ConfigService
  ) {}

  archiveDirectory() {
    const base = this.config.get<string>("BACKUP_PATH") ?? "./backups";
    return path.resolve(base, "activity-log-archive");
  }

  private exportQuery() {
    return `
      SELECT
        al.log_id,
        al.user_id,
        al.admin_id,
        al.action,
        al.details,
        al.timestamp,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        a.username AS admin_username,
        a.first_name AS admin_first_name,
        a.last_name AS admin_last_name,
        a.email AS admin_email,
        r.role_name
      FROM activity_logs al
      LEFT JOIN users u ON u.user_id = al.user_id
      LEFT JOIN admins a ON a.admin_id = al.admin_id
      LEFT JOIN roles r ON r.role_id = a.role_id
      ORDER BY al.timestamp ASC
    `;
  }

  async archiveAndReset() {
    const rows = (await this.db.query(this.exportQuery())) as ArchiveRow[];
    if (!rows.length) {
      return { archived: 0, file: null as string | null };
    }

    const archiveDir = this.archiveDirectory();
    await fs.mkdir(archiveDir, { recursive: true });

    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = `activity-logs-${stamp}.json`;
    const filePath = path.join(archiveDir, fileName);

    const payload = {
      archivedAt: new Date().toISOString(),
      count: rows.length,
      logs: rows.map((row) => ({
        id: row.log_id,
        action: row.action,
        details: row.details,
        timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
        userId: row.user_id,
        adminId: row.admin_id,
        username: row.username ?? row.admin_username ?? undefined,
        firstName: row.first_name ?? row.admin_first_name ?? undefined,
        lastName: row.last_name ?? row.admin_last_name ?? undefined,
        email: row.email ?? row.admin_email ?? undefined,
        source: this.resolveSource(row),
      })),
    };

    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
    await this.db.query(`DELETE FROM activity_logs`);

    this.logger.log(`Archived ${rows.length} activity logs to ${filePath}`);
    return { archived: rows.length, file: filePath };
  }

  async listArchiveFiles() {
    const archiveDir = this.archiveDirectory();
    try {
      const entries = await fs.readdir(archiveDir);
      return entries
        .filter((name) => name.startsWith("activity-logs-") && name.endsWith(".json"))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }

  async status() {
    const [{ count }] = (await this.db.query(
      `SELECT COUNT(*)::int AS count FROM activity_logs`
    )) as Array<{ count: number }>;
    const files = await this.listArchiveFiles();

    return {
      todayCount: count,
      archiveDirectory: this.archiveDirectory(),
      archivedFiles: files,
      lastArchivedFile: files[0] ?? null,
      resetsDailyAt: "00:00 server time",
    };
  }

  private resolveSource(row: ArchiveRow) {
    const detailsSource =
      row.details && typeof row.details === "object" && "source" in row.details
        ? String(row.details.source)
        : null;
    if (detailsSource) return detailsSource;
    if (row.role_name === "superadmin") return "superadmin";
    if (row.admin_id) return "admin";
    if (row.user_id) return "user";
    return "system";
  }
}
