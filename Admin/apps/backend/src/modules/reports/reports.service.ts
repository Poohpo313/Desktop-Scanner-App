import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class ReportsService {
  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource
  ) {}

  async summary() {
    const userStatsRows = (await this.db.query(`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE u.account_status = 'active')::int AS active_users,
        COUNT(*) FILTER (WHERE u.account_status <> 'active')::int AS inactive_users
      FROM users u
      INNER JOIN roles r ON r.role_id = u.role_id AND r.role_name = 'user'
      WHERE u.account_status <> 'deleted'
    `)) as Array<{
      total_users: number;
      active_users: number;
      inactive_users: number;
    }>;
    const userStats = userStatsRows[0];

    const keys = (await this.db.query(`
      SELECT status, COUNT(*)::int AS count
      FROM serial_keys
      GROUP BY status
    `)) as Array<{ status: string; count: number }>;
    const keyCounts = Object.fromEntries(keys.map((k) => [k.status, Number(k.count)]));

    const deviceStatsRows = (await this.db.query(`
      SELECT
        COUNT(*)::int AS registered_devices,
        COUNT(*) FILTER (WHERE status = 'active')::int AS active_devices
      FROM devices
    `)) as Array<{ registered_devices: number; active_devices: number }>;
    const deviceStats = deviceStatsRows[0];

    const recentActivity = (await this.db.query(`
      SELECT action, timestamp, user_id
      FROM activity_logs
      ORDER BY timestamp DESC
      LIMIT 20
    `)) as Array<{ action: string; timestamp: Date; user_id?: number }>;

    const filesPerDay = (await this.db.query(`
      SELECT TO_CHAR(upload_date, 'Dy') AS day, COUNT(*)::int AS count
      FROM documents
      WHERE upload_date >= NOW() - INTERVAL '7 days' AND is_deleted = FALSE
      GROUP BY TO_CHAR(upload_date, 'Dy'), DATE(upload_date)
      ORDER BY DATE(upload_date)
    `)) as Array<{ day: string; count: number }>;

    return {
      totalUsers: Number(userStats?.total_users ?? 0),
      activeUsers: Number(userStats?.active_users ?? 0),
      inactiveUsers: Number(userStats?.inactive_users ?? 0),
      activeKeys: (keyCounts.unused ?? 0) + (keyCounts.assigned ?? 0),
      usedKeys: keyCounts.used ?? 0,
      revokedKeys: keyCounts.revoked ?? 0,
      registeredDevices: Number(deviceStats?.registered_devices ?? 0),
      activeDevices: Number(deviceStats?.active_devices ?? 0),
      recentActivity: recentActivity.map((row) => ({
        action: row.action,
        timestamp: row.timestamp.toISOString(),
        userId: row.user_id ?? undefined
      })),
      keyUsage: [
        { name: "unused", value: keyCounts.unused ?? 0 },
        { name: "used", value: keyCounts.used ?? 0 },
        { name: "revoked", value: keyCounts.revoked ?? 0 },
        { name: "assigned", value: keyCounts.assigned ?? 0 }
      ],
      filesPerDay: filesPerDay.map((row) => ({
        day: row.day,
        count: Number(row.count)
      }))
    };
  }

  async exportCsv(type: string) {
    if (type === "users") {
      const rows = await this.db.query(`
        SELECT username, email, account_status, created_at
        FROM users u
        INNER JOIN roles r ON r.role_id = u.role_id AND r.role_name = 'user'
        ORDER BY created_at DESC
      `);
      return { type, rows };
    }
    if (type === "devices") {
      const rows = await this.db.query(`
        SELECT device_name, device_type, serial_number, status, last_seen
        FROM devices
        ORDER BY last_seen DESC NULLS LAST
      `);
      return { type, rows };
    }
    return { type, rows: [] };
  }
}
