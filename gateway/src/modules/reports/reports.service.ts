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

@Injectable()
export class ReportsService {
  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource,
    private readonly admins: AdminsService,
  ) {}

  async summaryForActor(actor: ScopedActor) {
    if (isSuperAdmin(actor.role)) {
      return this.summary();
    }

    const admin = await this.admins.findById(resolveActorId(actor));
    const scope = buildAdminScope(admin);
    if (!scope?.department) {
      return this.emptySummary();
    }

    const params: unknown[] = [];
    let userWhere = `u.account_status <> 'deleted'`;
    userWhere = appendAdminRecordScope(userWhere, scope, "u.company", "u.department", params);

    const userStatsRows = (await this.db.query(
      `
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE u.account_status = 'active')::int AS active_users,
        COUNT(*) FILTER (WHERE u.account_status <> 'active')::int AS inactive_users
      FROM users u
      INNER JOIN roles r ON r.role_id = u.role_id AND r.role_name = 'user'
      WHERE ${userWhere}
    `,
      params,
    )) as Array<{
      total_users: number;
      active_users: number;
      inactive_users: number;
    }>;

    const keyParams: unknown[] = [];
    let keyWhere = "1=1";
    keyWhere = appendAdminRecordScope(
      keyWhere,
      scope,
      "COALESCE(sk.company, u.company)",
      "COALESCE(sk.department, u.department)",
      keyParams,
    );

    const keys = (await this.db.query(
      `
      SELECT sk.status, COUNT(*)::int AS count
      FROM serial_keys sk
      LEFT JOIN users u ON u.user_id = sk.assigned_to
      WHERE ${keyWhere}
      GROUP BY sk.status
    `,
      keyParams,
    )) as Array<{ status: string; count: number }>;

    const deviceParams: unknown[] = [];
    let deviceWhere = `d.device_type = 'workstation' AND d.status NOT IN ('inactive', 'unauthorized')`;
    deviceWhere = appendAdminRecordScope(deviceWhere, scope, "u.company", "u.department", deviceParams);

    const deviceStatsRows = (await this.db.query(
      `
      SELECT
        COUNT(*)::int AS registered_devices,
        COUNT(*) FILTER (WHERE d.status = 'active')::int AS active_devices
      FROM devices d
      LEFT JOIN users u ON u.user_id = d.assigned_user
      WHERE ${deviceWhere}
    `,
      deviceParams,
    )) as Array<{ registered_devices: number; active_devices: number }>;

    const userStats = userStatsRows[0];
    const deviceStats = deviceStatsRows[0];
    const keyCounts = Object.fromEntries(keys.map((k) => [k.status, Number(k.count)]));

    return {
      ...this.emptySummary(),
      totalUsers: Number(userStats?.total_users ?? 0),
      activeUsers: Number(userStats?.active_users ?? 0),
      inactiveUsers: Number(userStats?.inactive_users ?? 0),
      activeKeys: (keyCounts.unused ?? 0) + (keyCounts.assigned ?? 0),
      usedKeys: keyCounts.used ?? 0,
      revokedKeys: keyCounts.revoked ?? 0,
      registeredDevices: Number(deviceStats?.registered_devices ?? 0),
      activeDevices: Number(deviceStats?.active_devices ?? 0),
      keyUsage: [
        { name: "unused", value: keyCounts.unused ?? 0 },
        { name: "used", value: keyCounts.used ?? 0 },
        { name: "revoked", value: keyCounts.revoked ?? 0 },
        { name: "assigned", value: keyCounts.assigned ?? 0 },
      ],
    };
  }

  private emptySummary() {
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      activeKeys: 0,
      usedKeys: 0,
      revokedKeys: 0,
      registeredDevices: 0,
      activeDevices: 0,
      recentActivity: [],
      keyUsage: [],
      filesPerDay: [],
      scannerActivity: {
        today: [],
        thisWeek: [],
        thisMonth: [],
        thisYear: [],
      },
    };
  }

  async exportCsvForActor(actor: ScopedActor, type: string) {
    if (isSuperAdmin(actor.role)) {
      return this.exportCsv(type);
    }

    const admin = await this.admins.findById(resolveActorId(actor));
    const scope = buildAdminScope(admin);
    if (!scope?.department) {
      return { type, rows: [] };
    }

    if (type === "users") {
      const params: unknown[] = [];
      let where = `u.account_status <> 'deleted'`;
      where = appendAdminRecordScope(where, scope, "u.company", "u.department", params);
      const rows = await this.db.query(
        `
        SELECT u.username, u.email, u.account_status, u.created_at
        FROM users u
        INNER JOIN roles r ON r.role_id = u.role_id AND r.role_name = 'user'
        WHERE ${where}
        ORDER BY u.created_at DESC
      `,
        params,
      );
      return { type, rows };
    }

    if (type === "devices") {
      const params: unknown[] = [];
      let where = `d.device_type = 'workstation'`;
      where = appendAdminRecordScope(where, scope, "u.company", "u.department", params);
      const rows = await this.db.query(
        `
        SELECT d.device_name, d.device_type, d.serial_number, d.status, d.last_seen
        FROM devices d
        LEFT JOIN users u ON u.user_id = d.assigned_user
        WHERE ${where}
        ORDER BY d.last_seen DESC NULLS LAST
      `,
        params,
      );
      return { type, rows };
    }

    return { type, rows: [] };
  }

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

    const scannerActivity = await this.buildScannerActivity();

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
      })),
      scannerActivity
    };
  }

  private async countActivationsByBucket(
    bucketSql: string,
    startSql: string,
    endSql = "NOW()"
  ) {
    const rows = (await this.db.query(`
      SELECT ${bucketSql} AS bucket, COUNT(*)::int AS count
      FROM activity_logs
      WHERE action IN ('key.activated', 'user.activated')
        AND timestamp >= ${startSql}
        AND timestamp < ${endSql}
      GROUP BY bucket
    `)) as Array<{ bucket: number | string; count: number }>;

    return Object.fromEntries(rows.map((row) => [String(row.bucket), Number(row.count)]));
  }

  private async countTodayActivations() {
    const rows = (await this.db.query(`
      SELECT
        LEAST(5, GREATEST(0, FLOOR((EXTRACT(HOUR FROM timestamp) - 8) / 2))) AS bucket,
        COUNT(*)::int AS count
      FROM activity_logs
      WHERE action IN ('key.activated', 'user.activated')
        AND timestamp >= DATE_TRUNC('day', CURRENT_TIMESTAMP)
        AND timestamp < DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '1 day'
      GROUP BY bucket
    `)) as Array<{ bucket: number; count: number }>;

    return Object.fromEntries(rows.map((row) => [String(row.bucket), Number(row.count)]));
  }

  private async countTodayRegistrations() {
    const rows = (await this.db.query(`
      SELECT
        LEAST(5, GREATEST(0, FLOOR((EXTRACT(HOUR FROM created_at) - 8) / 2))) AS bucket,
        COUNT(*)::int AS count
      FROM users u
      INNER JOIN roles r ON r.role_id = u.role_id AND r.role_name = 'user'
      WHERE u.account_status <> 'deleted'
        AND u.created_at >= DATE_TRUNC('day', CURRENT_TIMESTAMP)
        AND u.created_at < DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '1 day'
      GROUP BY bucket
    `)) as Array<{ bucket: number; count: number }>;

    return Object.fromEntries(rows.map((row) => [String(row.bucket), Number(row.count)]));
  }

  private async countRegistrationsByBucket(
    bucketSql: string,
    startSql: string,
    endSql = "NOW()"
  ) {
    const rows = (await this.db.query(`
      SELECT ${bucketSql} AS bucket, COUNT(*)::int AS count
      FROM users u
      INNER JOIN roles r ON r.role_id = u.role_id AND r.role_name = 'user'
      WHERE u.account_status <> 'deleted'
        AND u.created_at >= ${startSql}
        AND u.created_at < ${endSql}
      GROUP BY bucket
    `)) as Array<{ bucket: number | string; count: number }>;

    return Object.fromEntries(rows.map((row) => [String(row.bucket), Number(row.count)]));
  }

  private async buildScannerActivity() {
    const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const todayLabels = ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM"];

    const todayActivations = await this.countTodayActivations();
    const todayRegistrations = await this.countTodayRegistrations();

    const weekActivations = await this.countActivationsByBucket(
      "TO_CHAR(timestamp, 'Dy')",
      "DATE_TRUNC('week', NOW())",
      "DATE_TRUNC('week', NOW()) + INTERVAL '7 days'"
    );
    const weekRegistrations = await this.countRegistrationsByBucket(
      "TO_CHAR(created_at, 'Dy')",
      "DATE_TRUNC('week', NOW())",
      "DATE_TRUNC('week', NOW()) + INTERVAL '7 days'"
    );

    const monthActivations = await this.countActivationsByBucket(
      "EXTRACT(DAY FROM timestamp)::int",
      "DATE_TRUNC('month', NOW())",
      "DATE_TRUNC('month', NOW()) + INTERVAL '1 month'"
    );
    const monthRegistrations = await this.countRegistrationsByBucket(
      "EXTRACT(DAY FROM created_at)::int",
      "DATE_TRUNC('month', NOW())",
      "DATE_TRUNC('month', NOW()) + INTERVAL '1 month'"
    );

    const yearActivations = await this.countActivationsByBucket(
      "TO_CHAR(timestamp, 'Mon')",
      "DATE_TRUNC('year', NOW())",
      "DATE_TRUNC('year', NOW()) + INTERVAL '1 year'"
    );
    const yearRegistrations = await this.countRegistrationsByBucket(
      "TO_CHAR(created_at, 'Mon')",
      "DATE_TRUNC('year', NOW())",
      "DATE_TRUNC('year', NOW()) + INTERVAL '1 year'"
    );

    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();

    return {
      today: todayLabels.map((label, index) => ({
        label,
        activations: todayActivations[String(index)] ?? 0,
        registrations: todayRegistrations[String(index)] ?? 0
      })),
      thisWeek: weekLabels.map((label) => ({
        label,
        activations: weekActivations[label] ?? 0,
        registrations: weekRegistrations[label] ?? 0
      })),
      thisMonth: Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        return {
          label: String(day),
          activations: monthActivations[String(day)] ?? 0,
          registrations: monthRegistrations[String(day)] ?? 0
        };
      }),
      thisYear: monthLabels.map((label) => ({
        label,
        activations: yearActivations[label] ?? 0,
        registrations: yearRegistrations[label] ?? 0
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
