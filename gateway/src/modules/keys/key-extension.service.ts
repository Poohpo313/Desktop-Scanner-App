import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { resolveActorId, appendDepartmentScope, isSuperAdmin, type ScopedActor } from "../../shared/admin-scope";
import { AdminScopeService } from "../../shared/services/admin-scope.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { SerialKeyEntity } from "./entities/key.entity";
import {
  addDays,
  computeKeyExpiryState,
  maskSerialKey,
  type KeyExpiryThreshold,
} from "./key-expiry.util";

type KeyRow = {
  serialId: number;
  serialKey: string;
  assignedTo: number | null;
  assignedAdmin: number | null;
  status: string;
  generatedAt: Date;
  usedAt: Date | null;
  expiresAt: Date | null;
  durationDays: number | null;
  extendedAt: Date | null;
  extensionCount: number;
  extensionStatus: string | null;
  renewalStatus: string | null;
  trial: boolean;
  company: string | null;
  department: string | null;
  username?: string | null;
};

type ExtensionRequestRow = {
  requestId: number;
  serialKeyId: number;
  userId: number;
  adminId: number | null;
  type: "extension" | "renewal";
  requestedDays: number;
  status: string;
  userNote: string | null;
  adminNote: string | null;
  superadminNote: string | null;
  requestedAt: Date;
  forwardedAt: Date | null;
  resolvedAt: Date | null;
  serialKey?: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  department?: string | null;
  adminName?: string | null;
};

@Injectable()
export class KeyExtensionService {
  constructor(
    @InjectRepository(SerialKeyEntity, "online")
    private readonly keys: Repository<SerialKeyEntity>,
    private readonly activityLog: ActivityLogService,
    private readonly notifications: NotificationsGateway,
    private readonly adminScope: AdminScopeService,
  ) {}

  private async findUserKey(userId: number): Promise<KeyRow | null> {
    const rows = (await this.keys.query(
      `
      SELECT
        sk.serial_id AS "serialId",
        sk.serial_key AS "serialKey",
        sk.assigned_to AS "assignedTo",
        sk.assigned_admin AS "assignedAdmin",
        sk.status,
        sk.generated_at AS "generatedAt",
        sk.used_at AS "usedAt",
        sk.expires_at AS "expiresAt",
        sk.duration_days AS "durationDays",
        sk.extended_at AS "extendedAt",
        sk.extension_count AS "extensionCount",
        sk.extension_status AS "extensionStatus",
        sk.renewal_status AS "renewalStatus",
        sk.trial AS "trial",
        sk.company,
        sk.department,
        owner.username
      FROM serial_keys sk
      INNER JOIN users owner ON owner.user_id = $1
      WHERE sk.assigned_to = $1
         OR (
           TRIM(COALESCE(owner.serial_key, '')) <> ''
           AND LOWER(TRIM(sk.serial_key)) = LOWER(TRIM(owner.serial_key))
         )
      ORDER BY sk.serial_id DESC
      LIMIT 1`,
      [userId],
    )) as KeyRow[];
    return rows[0] ?? null;
  }

  private mapKeyStatus(key: KeyRow) {
    const expiry = computeKeyExpiryState(key.expiresAt, key.durationDays);
    let statusLabel: "Active" | "Expiring Soon" | "Expired" = "Active";
    if (expiry.isExpired) statusLabel = "Expired";
    else if (expiry.threshold === "amber" || expiry.threshold === "red") statusLabel = "Expiring Soon";

    return {
      serialKeyMasked: maskSerialKey(key.serialKey),
      statusLabel,
      activatedOn: key.usedAt ?? key.generatedAt,
      expiresAt: key.expiresAt,
      durationDays: key.durationDays,
      extensionCount: key.extensionCount,
      extensionStatus: key.extensionStatus,
      renewalStatus: key.renewalStatus,
      trial: key.trial,
      ...expiry,
    };
  }

  async getMyKeyStatus(userId: number) {
    const key = await this.findUserKey(userId);
    if (!key) {
      throw new NotFoundException("No serial key is assigned to your account.");
    }

    const adminRows = (await this.keys.query(
      `
      SELECT
        NULLIF(TRIM(CONCAT(COALESCE(a.first_name, ''), ' ', COALESCE(a.last_name, ''))), '') AS "adminName",
        NULLIF(TRIM(a.email), '') AS email,
        NULLIF(TRIM(a.phone_number), '') AS "phoneNumber",
        NULLIF(TRIM(a.department), '') AS department
      FROM serial_keys sk
      LEFT JOIN admins a ON a.admin_id = sk.assigned_admin
      WHERE sk.serial_id = $1
      LIMIT 1`,
      [key.serialId],
    )) as Array<{
      adminName: string | null;
      email: string | null;
      phoneNumber: string | null;
      department: string | null;
    }>;

    const pendingRows = (await this.keys.query(
      `SELECT request_id AS "requestId", status, type
       FROM extension_requests
       WHERE serial_key_id = $1 AND status IN ('pending_admin', 'pending_superadmin')
       ORDER BY requested_at DESC LIMIT 1`,
      [key.serialId],
    )) as Array<{ requestId: number; status: string; type: string }>;

    return {
      key: this.mapKeyStatus(key),
      assignedAdmin: adminRows[0] ?? null,
      pendingRequest: pendingRows[0] ?? null,
    };
  }

  private async createStoredNotification(payload: {
    userId?: number | null;
    adminId?: number | null;
    roleTarget: "user" | "admin" | "superadmin";
    company?: string | null;
    department?: string | null;
    eventType: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    await this.keys.query(
      `INSERT INTO stored_notifications
        (user_id, admin_id, role_target, company, department, event_type, title, message, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
      [
        payload.userId ?? null,
        payload.adminId ?? null,
        payload.roleTarget,
        payload.company ?? null,
        payload.department ?? null,
        payload.eventType,
        payload.title,
        payload.message,
        JSON.stringify(payload.data ?? {}),
      ],
    );

    this.notifications.emitKeyExtension({
      userId: payload.userId ?? null,
      company: payload.company ?? null,
      department: payload.department ?? null,
      eventType: payload.eventType,
      title: payload.title,
      message: payload.message,
      data: payload.data ?? {},
    });
  }

  private async applyExtensionDays(
    serialId: number,
    days: number,
    options: {
      type: "extension" | "renewal" | "direct";
      userId?: number | null;
      adminId?: number | null;
      note?: string | null;
      requestId?: number | null;
    },
  ) {
    return this.keys.manager.transaction(async (manager) => {
      const rows = (await manager.query(
        `SELECT serial_id, expires_at, duration_days, assigned_to, company, department
         FROM serial_keys WHERE serial_id = $1 FOR UPDATE`,
        [serialId],
      )) as Array<{
        serial_id: number;
        expires_at: Date | null;
        duration_days: number | null;
        assigned_to: number | null;
        company: string | null;
        department: string | null;
      }>;

      const key = rows[0];
      if (!key) throw new NotFoundException("Serial key not found");

      const now = new Date();
      const base =
        key.expires_at && new Date(key.expires_at) > now ? new Date(key.expires_at) : now;
      const newExpiresAt = addDays(base, days);
      const nextDuration = Math.max(days, key.duration_days ?? days);

      const statusColumn =
        options.type === "renewal" ? "renewal_status" : "extension_status";

      await manager.query(
        `UPDATE serial_keys
         SET expires_at = $1,
             duration_days = $2,
             extended_at = NOW(),
             extension_count = extension_count + 1,
             ${statusColumn} = 'approved'
         WHERE serial_id = $3`,
        [newExpiresAt, nextDuration, serialId],
      );

      if (options.requestId) {
        await manager.query(
          `UPDATE extension_requests
           SET status = 'approved', resolved_at = NOW(), superadmin_note = COALESCE($2, superadmin_note)
           WHERE request_id = $1`,
          [options.requestId, options.note ?? null],
        );
      } else {
        const auditUserId = key.assigned_to ?? options.userId ?? null;
        if (auditUserId) {
          await manager.query(
            `INSERT INTO extension_requests
              (serial_key_id, user_id, admin_id, type, requested_days, status, superadmin_note, requested_at, resolved_at)
             VALUES ($1, $2, $3, $4, $5, 'approved', $6, NOW(), NOW())`,
            [
              serialId,
              auditUserId,
              options.adminId ?? null,
              options.type === "renewal" ? "renewal" : "extension",
              days,
              options.note ?? null,
            ],
          );
        }
      }

      await this.activityLog.log(
        "key.expiry.extended",
        { serialId, days, newExpiresAt, type: options.type },
        { adminId: options.adminId ?? undefined, userId: key.assigned_to ?? undefined },
      );

      if (key.assigned_to) {
        await this.createStoredNotification({
          userId: key.assigned_to,
          roleTarget: "user",
          company: key.company,
          department: key.department,
          eventType: "key.extension.approved",
          title: "Key extension approved",
          message: `Your key extension has been approved. New expiry: ${newExpiresAt.toISOString().slice(0, 10)}.`,
          data: { serialId, newExpiresAt, days },
        });
      }

      return { serialId, expiresAt: newExpiresAt, durationDays: nextDuration };
    });
  }

  async submitRequest(userId: number, type: "extension" | "renewal", requestedDays: number, userNote?: string) {
    const key = await this.findUserKey(userId);
    if (!key) throw new NotFoundException("No serial key is assigned to your account.");

    const expiry = computeKeyExpiryState(key.expiresAt, key.durationDays);
    if (type === "extension" && expiry.isExpired) {
      throw new BadRequestException("Key has expired. Submit a renewal request instead.");
    }
    if (type === "renewal" && !expiry.isExpired) {
      throw new BadRequestException("Key is still active. Submit an extension request instead.");
    }

    const pending = (await this.keys.query(
      `SELECT request_id FROM extension_requests
       WHERE serial_key_id = $1 AND status IN ('pending_admin', 'pending_superadmin')
       LIMIT 1`,
      [key.serialId],
    )) as Array<{ request_id: number }>;
    if (pending[0]) {
      throw new BadRequestException("You already have a pending request for this key.");
    }

    const statusColumn = type === "renewal" ? "renewal_status" : "extension_status";
    const rows = (await this.keys.query(
      `INSERT INTO extension_requests
        (serial_key_id, user_id, admin_id, type, requested_days, status, user_note)
       VALUES ($1, $2, $3, $4, $5, 'pending_admin', $6)
       RETURNING request_id AS "requestId"`,
      [key.serialId, userId, key.assignedAdmin, type, requestedDays, userNote?.trim() || null],
    )) as Array<{ requestId: number }>;

    await this.keys.query(
      `UPDATE serial_keys SET ${statusColumn} = 'pending' WHERE serial_id = $1`,
      [key.serialId],
    );

    const adminRows = (await this.keys.query(
      `SELECT admin_id AS "adminId",
              NULLIF(TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))), '') AS "adminName"
       FROM admins WHERE admin_id = $1 LIMIT 1`,
      [key.assignedAdmin],
    )) as Array<{ adminId: number; adminName: string | null }>;

    const userRows = (await this.keys.query(
      `SELECT username, first_name AS "firstName", last_name AS "lastName" FROM users WHERE user_id = $1`,
      [userId],
    )) as Array<{ username: string; firstName: string | null; lastName: string | null }>;
    const userName =
      [userRows[0]?.firstName, userRows[0]?.lastName].filter(Boolean).join(" ").trim() ||
      userRows[0]?.username ||
      "User";

    if (key.assignedAdmin) {
      await this.createStoredNotification({
        adminId: key.assignedAdmin,
        roleTarget: "admin",
        company: key.company,
        department: key.department,
        eventType: "key.extension.requested",
        title: "New key extension request",
        message: `New key extension request from ${userName}.`,
        data: { requestId: rows[0]?.requestId, userId, type, requestedDays },
      });
    }

    await this.activityLog.log(
      "key.extension.requested",
      { requestId: rows[0]?.requestId, serialId: key.serialId, type, requestedDays },
      { userId },
    );

    return {
      requestId: rows[0]?.requestId,
      adminName: adminRows[0]?.adminName ?? "your assigned admin",
      message: `Request sent to ${adminRows[0]?.adminName ?? "your assigned admin"}. You will be notified once it is reviewed.`,
    };
  }

  private baseRequestSelect() {
    return `
      SELECT
        er.request_id AS "requestId",
        er.serial_key_id AS "serialKeyId",
        er.user_id AS "userId",
        er.admin_id AS "adminId",
        er.type,
        er.requested_days AS "requestedDays",
        er.status,
        er.user_note AS "userNote",
        er.admin_note AS "adminNote",
        er.superadmin_note AS "superadminNote",
        er.requested_at AS "requestedAt",
        er.forwarded_at AS "forwardedAt",
        er.resolved_at AS "resolvedAt",
        sk.serial_key AS "serialKey",
        u.username,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        COALESCE(u.company, sk.company) AS company,
        COALESCE(u.department, sk.department) AS department,
        NULLIF(TRIM(CONCAT(COALESCE(a.first_name, ''), ' ', COALESCE(a.last_name, ''))), '') AS "adminName"
      FROM extension_requests er
      INNER JOIN serial_keys sk ON sk.serial_id = er.serial_key_id
      INNER JOIN users u ON u.user_id = er.user_id
      LEFT JOIN admins a ON a.admin_id = er.admin_id`;
  }

  async listAdminRequests(actor: ScopedActor) {
    try {
      if (isSuperAdmin(actor.role)) {
        return this.keys.query(
          `${this.baseRequestSelect()}
         WHERE er.status = 'pending_admin'
         ORDER BY er.requested_at ASC`,
        ) as Promise<ExtensionRequestRow[]>;
      }

      const scope = await this.adminScope.resolveScope(actor);
      if (!scope?.company) return [];

      const params: unknown[] = [scope.company];
      const sql = appendDepartmentScope(
        `${this.baseRequestSelect()}
       WHERE er.status = 'pending_admin'
         AND LOWER(TRIM(COALESCE(u.company, sk.company, ''))) = LOWER(TRIM($1))`,
        scope,
        "COALESCE(u.department, sk.department)",
        params,
        { requireDepartments: true },
      );

      return this.keys.query(`${sql} ORDER BY er.requested_at ASC`, params) as Promise<ExtensionRequestRow[]>;
    } catch {
      return [];
    }
  }

  async listSuperAdminRequests() {
    try {
      return this.keys.query(
        `${this.baseRequestSelect()}
       WHERE er.status = 'pending_superadmin'
       ORDER BY er.forwarded_at ASC NULLS LAST, er.requested_at ASC`,
      ) as Promise<ExtensionRequestRow[]>;
    } catch {
      return [];
    }
  }

  async forwardRequest(actor: ScopedActor, requestId: number, adminNote?: string) {
    const adminId = resolveActorId(actor);
    const rows = (await this.keys.query(
      `${this.baseRequestSelect()} WHERE er.request_id = $1 LIMIT 1`,
      [requestId],
    )) as ExtensionRequestRow[];
    const request = rows[0];
    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "pending_admin") {
      throw new BadRequestException("Only pending admin requests can be forwarded.");
    }

    if (!isSuperAdmin(actor.role)) {
      await this.adminScope.assertRecordInScope(
        actor,
        { company: request.company, department: request.department },
        "You can only forward requests from your department.",
      );
    }

    await this.keys.query(
      `UPDATE extension_requests
       SET status = 'pending_superadmin', admin_note = COALESCE($2, admin_note), forwarded_at = NOW(), admin_id = $3
       WHERE request_id = $1`,
      [requestId, adminNote?.trim() || null, adminId],
    );

    const userName =
      [request.firstName, request.lastName].filter(Boolean).join(" ").trim() || request.username;

    await this.createStoredNotification({
      roleTarget: "superadmin",
      company: request.company,
      department: request.department,
      eventType: "key.extension.forwarded",
      title: "Key extension request forwarded",
      message: `Key extension request forwarded by ${request.adminName ?? "an admin"} for ${userName} in ${request.department ?? "their department"}.`,
      data: { requestId, userId: request.userId },
    });

    return { success: true, requestId };
  }

  async rejectRequest(actor: ScopedActor, requestId: number, note?: string, scope: "admin" | "superadmin" = "admin") {
    const rows = (await this.keys.query(
      `${this.baseRequestSelect()} WHERE er.request_id = $1 LIMIT 1`,
      [requestId],
    )) as ExtensionRequestRow[];
    const request = rows[0];
    if (!request) throw new NotFoundException("Request not found");

    const expectedStatus = scope === "admin" ? "pending_admin" : "pending_superadmin";
    if (request.status !== expectedStatus) {
      throw new BadRequestException("This request is not in the expected pending state.");
    }

    if (!isSuperAdmin(actor.role) && scope === "admin") {
      await this.adminScope.assertRecordInScope(
        actor,
        { company: request.company, department: request.department },
        "You can only reject requests from your department.",
      );
    }

    const noteColumn = scope === "admin" ? "admin_note" : "superadmin_note";
    await this.keys.query(
      `UPDATE extension_requests
       SET status = 'rejected', ${noteColumn} = COALESCE($2, ${noteColumn}), resolved_at = NOW()
       WHERE request_id = $1`,
      [requestId, note?.trim() || null],
    );

    const statusColumn = request.type === "renewal" ? "renewal_status" : "extension_status";
    await this.keys.query(
      `UPDATE serial_keys SET ${statusColumn} = 'rejected' WHERE serial_id = $1`,
      [request.serialKeyId],
    );

    await this.createStoredNotification({
      userId: request.userId,
      roleTarget: "user",
      company: request.company,
      department: request.department,
      eventType: "key.extension.rejected",
      title: "Extension request reviewed",
      message: "Your extension request was reviewed. Please contact your admin for more information.",
      data: { requestId },
    });

    if (request.adminId) {
      await this.createStoredNotification({
        adminId: request.adminId,
        roleTarget: "admin",
        company: request.company,
        department: request.department,
        eventType: "key.extension.resolved",
        title: "Extension request update",
        message: `Update on ${request.username}'s extension request.`,
        data: { requestId, status: "rejected" },
      });
    }

    return { success: true, requestId };
  }

  async approveRequest(actor: ScopedActor, requestId: number, requestedDays: number, superadminNote?: string) {
    const rows = (await this.keys.query(
      `${this.baseRequestSelect()} WHERE er.request_id = $1 LIMIT 1`,
      [requestId],
    )) as ExtensionRequestRow[];
    const request = rows[0];
    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "pending_superadmin") {
      throw new BadRequestException("Only forwarded requests can be approved.");
    }

    const result = await this.applyExtensionDays(request.serialKeyId, requestedDays, {
      type: request.type,
      userId: request.userId,
      adminId: resolveActorId(actor),
      note: superadminNote,
      requestId,
    });

    if (request.adminId) {
      await this.createStoredNotification({
        adminId: request.adminId,
        roleTarget: "admin",
        company: request.company,
        department: request.department,
        eventType: "key.extension.resolved",
        title: "Extension request update",
        message: `Update on ${request.username}'s extension request.`,
        data: { requestId, status: "approved" },
      });
    }

    return { success: true, requestId, ...result };
  }

  async modifyExpiryDirect(serialId: number, durationDays: number, adminId: number, note?: string) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new NotFoundException("Serial key not found");

    return this.applyExtensionDays(serialId, durationDays, {
      type: "direct",
      adminId,
      note,
      userId: key.assignedTo ?? null,
    });
  }

  async runExpiryNotifications() {
    const rows = (await this.keys.query(
      `SELECT
        sk.serial_id AS "serialId",
        sk.assigned_to AS "userId",
        sk.expires_at AS "expiresAt",
        sk.duration_days AS "durationDays",
        sk.company,
        sk.department
       FROM serial_keys sk
       WHERE sk.assigned_to IS NOT NULL
         AND sk.expires_at IS NOT NULL
         AND sk.status IN ('used', 'assigned')`,
    )) as Array<{
      serialId: number;
      userId: number;
      expiresAt: Date;
      durationDays: number | null;
      company: string | null;
      department: string | null;
    }>;

    for (const row of rows) {
      const expiry = computeKeyExpiryState(row.expiresAt, row.durationDays);
      if (!expiry.hasExpiry || !row.userId) continue;

      const events: Array<{ type: string; title: string; message: string }> = [];

      if (expiry.isExpired) {
        events.push({
          type: "key.expiry.expired",
          title: "Key expired",
          message: "Your serial key has expired. Please request a renewal to continue using the application.",
        });
      } else if (expiry.threshold === "red" && expiry.daysRemaining === 7) {
        events.push({
          type: "key.expiry.seven_days",
          title: "Key expiring soon",
          message: "Your serial key expires in 7 days. Request an extension to avoid interruption.",
        });
      } else if (
        expiry.percentConsumed != null &&
        expiry.percentConsumed >= 50 &&
        expiry.percentConsumed < 51
      ) {
        events.push({
          type: "key.expiry.halfway",
          title: "Key validity update",
          message: `Your serial key is halfway through its validity. ${expiry.daysRemaining} days remaining.`,
        });
      }

      for (const event of events) {
        const existing = (await this.keys.query(
          `SELECT notification_id FROM stored_notifications
           WHERE user_id = $1 AND event_type = $2
             AND created_at > NOW() - INTERVAL '2 days'
           LIMIT 1`,
          [row.userId, event.type],
        )) as Array<{ notification_id: number }>;
        if (existing[0]) continue;

        await this.createStoredNotification({
          userId: row.userId,
          roleTarget: "user",
          company: row.company,
          department: row.department,
          eventType: event.type,
          title: event.title,
          message: event.message,
          data: { serialId: row.serialId, daysRemaining: expiry.daysRemaining },
        });
      }
    }
  }

  computeDaysLeftDisplay(expiresAt: Date | null, durationDays: number | null) {
    const state = computeKeyExpiryState(expiresAt, durationDays);
    return state;
  }
}

export type { KeyExpiryThreshold };
