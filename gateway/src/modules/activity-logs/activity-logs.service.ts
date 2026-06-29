import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
  appendAdminRecordScope,
  buildAdminScope,
  isSuperAdmin,
  resolveActorId,
  type ScopedActor,
} from "../../shared/admin-scope";
import { AdminsService } from "../admins/admins.service";

type ActivityLogRecord = {
  log_id: number;
  action: string;
  details: Record<string, unknown> | null;
  timestamp: Date;
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
export class ActivityLogsService {
  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource,
    private readonly admins: AdminsService,
  ) {}

  async listForActor(actor: ScopedActor) {
    if (isSuperAdmin(actor.role)) {
      return this.list();
    }

    const admin = await this.admins.findById(resolveActorId(actor));
    const scope = buildAdminScope(admin);
    if (!scope?.department) return [];

    const params: unknown[] = [];
    let where = "1=1";
    where = appendAdminRecordScope(where, scope, "u.company", "u.department", params);

    const rows = (await this.db.query(
      `
      SELECT
        al.log_id,
        al.action,
        al.details,
        al.timestamp,
        al.user_id,
        al.admin_id,
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
      WHERE ${where}
      ORDER BY al.timestamp DESC
    `,
      params,
    )) as ActivityLogRecord[];

    return this.mapRows(rows);
  }

  async list() {
    const rows = (await this.db.query(`
      SELECT
        al.log_id,
        al.action,
        al.details,
        al.timestamp,
        al.user_id,
        al.admin_id,
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
      ORDER BY al.timestamp DESC
    `)) as ActivityLogRecord[];

    return this.mapRows(rows);
  }

  private mapRows(rows: ActivityLogRecord[]) {
    return rows.map((row) => ({
      id: String(row.log_id),
      action: row.action,
      activity: row.action,
      details: row.details,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
      username: row.username ?? row.admin_username ?? undefined,
      firstName: row.first_name ?? row.admin_first_name ?? undefined,
      lastName: row.last_name ?? row.admin_last_name ?? undefined,
      email: row.email ?? row.admin_email ?? undefined,
      registeredUser: this.resolveActor(row),
      source: this.resolveSource(row),
    }));
  }

  private resolveActor(row: ActivityLogRecord) {
    const userName = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
    if (userName) return userName;
    if (row.username) return row.username;

    const adminName = [row.admin_first_name, row.admin_last_name].filter(Boolean).join(" ").trim();
    if (adminName) return adminName;
    if (row.admin_username) return row.admin_username;

    return row.email ?? row.admin_email ?? "-";
  }

  private resolveSource(row: ActivityLogRecord) {
    const detailsSource =
      row.details && typeof row.details === "object" && "source" in row.details
        ? String(row.details.source)
        : null;
    if (detailsSource) return detailsSource;
    if (row.role_name === "superadmin") return "Super Admin";
    if (row.admin_id) return "Admin";
    if (row.user_id) return "User App";
    return "System";
  }
}
