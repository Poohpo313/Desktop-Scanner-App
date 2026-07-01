import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { v4 as uuidv4 } from "uuid";
import { Repository } from "typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import {
  appendDepartmentScope,
  buildAdminScope,
  isSuperAdmin,
  matchesAdminScope,
  resolveActorId,
  type ScopedActor,
} from "../../shared/admin-scope";
import type { PaginationInput } from "../../shared/pagination";
import { queryScopedList } from "../../shared/scoped-query";
import { AdminScopeService } from "../../shared/services/admin-scope.service";
import type { JwtPayload } from "../../shared/types/index";
import { AdminsService } from "../admins/admins.service";
import { ADMIN_DEACTIVATED_NOTE } from "../devices/device-status.constants";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { SerialKeyEntity } from "./entities/key.entity";

type GenerateOptions = {
  adminId?: number;
  company?: string;
  department?: string;
  expirationDays?: number;
};

@Injectable()
export class KeysService {
  constructor(
    @InjectRepository(SerialKeyEntity, "online")
    private readonly keys: Repository<SerialKeyEntity>,
    private readonly activityLog: ActivityLogService,
    private readonly notifications: NotificationsGateway,
    private readonly admins: AdminsService,
    private readonly adminScope: AdminScopeService,
  ) {}

  generateKey(): string {
    return uuidv4();
  }

  private resolveExpiresAt(expirationDays?: number) {
    if (!expirationDays) return null;
    return new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
  }

  async generate(options: GenerateOptions = {}) {
    const serialKey = this.generateKey();
    const company = options.company?.trim() || null;
    const department = options.department?.trim() || null;
    const durationDays = options.expirationDays ?? null;

    const rows = await this.keys.query(
      `INSERT INTO serial_keys (serial_key, status, assigned_admin, company, department, expires_at, duration_days)
       VALUES ($1, 'unused', $2, $3, $4, NULL, $5)
       RETURNING
         serial_id AS "serialId",
         serial_key AS "serialKey",
         assigned_admin AS "assignedAdmin",
         status,
         generated_at AS "generatedAt",
         expires_at AS "expiresAt",
         duration_days AS "durationDays",
         company,
         department`,
      [serialKey, options.adminId ?? null, company, department, durationDays]
    );

    const saved = rows[0] as SerialKeyEntity;
    await this.activityLog.log(
      "key.generated",
      { serialId: saved.serialId, company, department },
      { adminId: options.adminId }
    );
    return saved;
  }

  findAll() {
    return this.reconcileUnassignedKeys().then(() =>
      this.keys.query(`
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
        sk.extension_count AS "extensionCount",
        sk.extension_status AS "extensionStatus",
        sk.renewal_status AS "renewalStatus",
        sk.trial AS "trial",
        sk.company AS "company",
        sk.department AS "department",
        u.username AS "username"
      FROM serial_keys sk
      LEFT JOIN users u ON u.user_id = sk.assigned_to
      ORDER BY sk.generated_at DESC
    `),
    );
  }

  private async reconcileUnassignedKeys() {
    await this.keys.query(`
      UPDATE serial_keys
      SET status = 'unused',
          used_at = NULL,
          expires_at = NULL
      WHERE assigned_to IS NULL
        AND status IN ('used', 'assigned')
    `);
  }

  async generateForActor(actor: ScopedActor, options: GenerateOptions = {}) {
    const adminId = resolveActorId(actor);
    if (isSuperAdmin(actor.role)) {
      return this.generate({ ...options, adminId });
    }

    const admin = await this.admins.findById(adminId);
    const scope = buildAdminScope(admin);
    if (!scope?.department) {
      throw new ForbiddenException("Admin department assignment is required before generating keys.");
    }

    return this.generate({
      ...options,
      adminId,
      company: scope.company,
      department: scope.department,
    });
  }

  async findAllForActor(actor: ScopedActor, pagination?: PaginationInput) {
    await this.reconcileUnassignedKeys();

    if (isSuperAdmin(actor.role)) {
      return queryScopedList(this.keys, {
        baseSql: `
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
        sk.extension_count AS "extensionCount",
        sk.extension_status AS "extensionStatus",
        sk.renewal_status AS "renewalStatus",
        sk.trial AS "trial",
        sk.company AS "company",
        sk.department AS "department",
        u.username AS "username"
      FROM serial_keys sk
      LEFT JOIN users u ON u.user_id = sk.assigned_to
      WHERE sk.status NOT IN ('revoked', 'deactivated')`,
        params: [],
        orderSql: "ORDER BY sk.generated_at DESC",
        pagination,
      });
    }

    const scope = await this.adminScope.resolveScope(actor);
    if (!scope?.company || !scope.department) return [];

    const params: unknown[] = [scope.company];
    const scopedSql = appendDepartmentScope(
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
        sk.extension_count AS "extensionCount",
        sk.extension_status AS "extensionStatus",
        sk.renewal_status AS "renewalStatus",
        sk.trial AS "trial",
        sk.company AS "company",
        sk.department AS "department",
        u.username AS "username"
      FROM serial_keys sk
      LEFT JOIN users u ON u.user_id = sk.assigned_to
      WHERE LOWER(TRIM(COALESCE(sk.company, ''))) = LOWER(TRIM($1))
        AND sk.status NOT IN ('revoked', 'deactivated')`,
      scope,
      "COALESCE(sk.department, u.department)",
      params,
      { requireDepartments: true },
    );

    return queryScopedList(this.keys, {
      baseSql: scopedSql,
      params,
      orderSql: "ORDER BY sk.generated_at DESC",
      pagination,
    });
  }

  findRevocations() {
    return this.findRevocationsInternal();
  }

  findRecycleBin() {
    return this.keys
      .query(
        `
      SELECT
        sk.serial_id AS "serialId",
        sk.serial_key AS "serialKey",
        sk.assigned_to AS "assignedTo",
        sk.status,
        sk.generated_at AS "generatedAt",
        sk.company AS "company",
        sk.department AS "department",
        u.username AS "username",
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        COALESCE(sk.used_at, sk.generated_at) AS "revokedAt"
      FROM serial_keys sk
      LEFT JOIN users u ON u.user_id = sk.assigned_to
      WHERE sk.status IN ('revoked', 'deactivated')
        AND sk.assigned_to IS NULL
      ORDER BY "revokedAt" DESC
    `,
      )
      .catch(() => []);
  }

  private async reconcileStaleRevocationRequests() {
    try {
      await this.keys.query(`
      UPDATE revocation_requests rr
      SET status = 'rejected',
          resolved_at = COALESCE(rr.resolved_at, NOW())
      WHERE rr.status IN ('pending', 'approved')
        AND (
          (rr.request_type = 'key' AND NOT EXISTS (
            SELECT 1 FROM serial_keys sk
            WHERE sk.serial_id = rr.target_id
              AND sk.status NOT IN ('revoked', 'deactivated')
          ))
          OR (rr.request_type = 'device' AND NOT EXISTS (
            SELECT 1 FROM devices d
            WHERE d.device_id = rr.target_id
              AND d.status NOT IN ('unauthorized', 'inactive')
          ))
        )
    `);
    } catch {
      /* revocation_requests or device hierarchy schema may be missing on older databases */
    }
  }

  private async findRevocationRequestsByStatus(status: "pending") {
    try {
      return (await this.keys.query(
        `
        SELECT
          'request-' || rr.request_id AS "recordId",
          CASE WHEN rr.request_type = 'key' THEN rr.target_id END AS "serialId",
          CASE WHEN rr.request_type = 'device' THEN rr.target_id END AS "deviceId",
          COALESCE(
            sk.serial_key,
            d.serial_number,
            d.device_name,
            CASE WHEN d.device_id IS NOT NULL THEN 'Device #' || d.device_id::text END
          ) AS "serialKey",
          COALESCE(sk.status, d.status) AS status,
          COALESCE(sk.generated_at, d.last_seen, rr.created_at) AS "generatedAt",
          COALESCE(u.company, sk.company) AS company,
          COALESCE(u.department, sk.department) AS department,
          u.username,
          u.first_name AS "firstName",
          u.last_name AS "lastName",
          'revocation.requested' AS action,
          rr.created_at AS "revokedAt",
          requester.username AS "revokedByUsername",
          requester.first_name AS "revokedByFirstName",
          requester.last_name AS "revokedByLastName",
          requester_role.role_name AS "revokedByRole",
          rr.request_id AS "requestId",
          rr.status AS "requestStatus",
          rr.reason AS "reason"
        FROM revocation_requests rr
        LEFT JOIN serial_keys sk ON rr.request_type = 'key' AND sk.serial_id = rr.target_id
        LEFT JOIN devices d ON rr.request_type = 'device' AND d.device_id = rr.target_id
        LEFT JOIN users u ON u.user_id = COALESCE(sk.assigned_to, d.assigned_user)
        LEFT JOIN admins requester ON requester.admin_id = rr.requested_by
        LEFT JOIN roles requester_role ON requester_role.role_id = requester.role_id
        WHERE rr.status = $1
          AND (
            (rr.request_type = 'key' AND sk.serial_id IS NOT NULL)
            OR (rr.request_type = 'device' AND d.device_id IS NOT NULL)
          )
        ORDER BY rr.created_at DESC
      `,
        [status],
      )) as Array<Record<string, unknown>>;
    } catch {
      return [];
    }
  }

  private async findDirectRevocations() {
    try {
      return (await this.keys.query(`
        SELECT *
        FROM (
          SELECT
            'key-' || sk.serial_id AS "recordId",
            sk.serial_id AS "serialId",
            NULL::integer AS "deviceId",
            sk.serial_key AS "serialKey",
            sk.status,
            sk.generated_at AS "generatedAt",
            COALESCE(sk.company, u.company) AS company,
            COALESCE(sk.department, u.department) AS department,
            u.username,
            u.first_name AS "firstName",
            u.last_name AS "lastName",
            CASE WHEN sk.status = 'deactivated' THEN 'key.deactivated' ELSE 'key.revoked' END AS action,
            COALESCE(sk.used_at, sk.generated_at) AS "revokedAt",
            NULL::varchar AS "revokedByUsername",
            NULL::varchar AS "revokedByFirstName",
            NULL::varchar AS "revokedByLastName",
            NULL::varchar AS "revokedByRole",
            NULL::integer AS "requestId",
            NULL::varchar AS "requestStatus",
            NULL::text AS "reason"
          FROM serial_keys sk
          LEFT JOIN users u ON u.user_id = sk.assigned_to
          WHERE sk.status = 'revoked'
            AND NOT EXISTS (
              SELECT 1
              FROM revocation_requests rr
              WHERE rr.request_type = 'key'
                AND rr.target_id = sk.serial_id
                AND rr.status = 'pending'
            )

          UNION ALL

          SELECT
            'device-' || d.device_id AS "recordId",
            NULL::integer AS "serialId",
            d.device_id AS "deviceId",
            COALESCE(d.serial_number, d.device_name, 'Device #' || d.device_id::text) AS "serialKey",
            d.status,
            COALESCE(d.last_seen, NOW()) AS "generatedAt",
            u.company,
            u.department,
            u.username,
            u.first_name AS "firstName",
            u.last_name AS "lastName",
            'device.revoked' AS action,
            COALESCE(d.last_seen, NOW()) AS "revokedAt",
            NULL::varchar AS "revokedByUsername",
            NULL::varchar AS "revokedByFirstName",
            NULL::varchar AS "revokedByLastName",
            NULL::varchar AS "revokedByRole",
            NULL::integer AS "requestId",
            NULL::varchar AS "requestStatus",
            NULL::text AS "reason"
          FROM devices d
          LEFT JOIN users u ON u.user_id = d.assigned_user
          WHERE d.status = 'unauthorized'
            AND d.warning_note IS NULL
            AND NOT EXISTS (
              SELECT 1
              FROM revocation_requests rr
              WHERE rr.request_type = 'device'
                AND rr.target_id = d.device_id
                AND rr.status = 'pending'
            )
        ) revocations
        WHERE revocations."serialKey" IS NOT NULL
        ORDER BY "revokedAt" DESC
      `)) as Array<Record<string, unknown>>;
    } catch {
      return [];
    }
  }

  private async findRevocationsInternal() {
    await this.reconcileStaleRevocationRequests();

    const [pending, direct] = await Promise.all([
      this.findRevocationRequestsByStatus("pending"),
      this.findDirectRevocations(),
    ]);

    return [...pending, ...direct].sort((a, b) => {
      const left = new Date(String(a.revokedAt ?? 0)).getTime();
      const right = new Date(String(b.revokedAt ?? 0)).getTime();
      return right - left;
    });
  }

  async permanentDelete(serialId: number, adminId?: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    if (!["revoked", "deactivated"].includes(key.status)) {
      throw new BadRequestException("Only revoked keys can be permanently removed");
    }
    await this.keys.query(
      `DELETE FROM revocation_requests WHERE request_type = 'key' AND target_id = $1`,
      [serialId],
    );
    await this.keys.delete({ serialId });
    await this.activityLog.log("key.permanently_deleted", { serialId }, { adminId });
    return { success: true };
  }

  async deleteAll(adminId?: number) {
    const result = await this.keys.query(`DELETE FROM serial_keys`);
    await this.activityLog.log("keys.cleared", {}, { adminId });
    return { deleted: result?.[1] ?? 0 };
  }

  async assignForActor(actor: ScopedActor, serialId: number, userId: number) {
    const adminId = resolveActorId(actor);
    if (!isSuperAdmin(actor.role)) {
      const scope = await this.adminScope.resolveScope(actor);
      const userRows = (await this.keys.query(
        `SELECT user_id, company, department FROM users WHERE user_id = $1 AND account_status <> 'deleted' LIMIT 1`,
        [userId],
      )) as Array<{ user_id: number; company: string | null; department: string | null }>;
      const targetUser = userRows[0];
      if (!targetUser || !matchesAdminScope(scope, targetUser)) {
        throw new ForbiddenException("You can only assign keys to users in your assigned department.");
      }

      const keyRows = (await this.keys.query(
        `SELECT serial_id, company, department FROM serial_keys WHERE serial_id = $1 LIMIT 1`,
        [serialId],
      )) as Array<{ serial_id: number; company: string | null; department: string | null }>;
      await this.adminScope.assertRecordInScope(
        actor,
        keyRows[0] ?? {},
        "You can only assign keys from your assigned department.",
      );
    }

    return this.assign(serialId, userId, adminId);
  }

  async assign(serialId: number, userId: number, adminId?: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    if (key.status !== "unused" && key.status !== "assigned") {
      throw new BadRequestException(`Serial key is ${key.status}`);
    }
    if (!key.expiresAt && key.durationDays) {
      key.expiresAt = this.resolveExpiresAt(key.durationDays) ?? undefined;
    }
    key.assignedTo = userId;
    key.status = "assigned";
    if (adminId && !key.assignedAdmin) {
      key.assignedAdmin = adminId;
    }
    const saved = await this.keys.save(key);
    await this.keys.query(`UPDATE users SET serial_key = $1 WHERE user_id = $2`, [
      key.serialKey,
      userId
    ]);
    await this.activityLog.log("key.assigned", { serialId, userId }, { adminId });
    return saved;
  }

  async revoke(serialId: number, adminId?: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    key.status = "revoked";
    const saved = await this.keys.save(key);

    if (key.assignedTo) {
      await this.keys.query(
        `UPDATE users
         SET account_status = 'deleted', deleted_at = NOW(), updated_at = NOW()
         WHERE user_id = $1`,
        [key.assignedTo]
      );
      await this.keys.query(
        `UPDATE devices
         SET status = 'inactive', warning_note = $2, last_seen = NOW()
         WHERE assigned_user = $1 AND device_type = 'workstation'`,
        [key.assignedTo, ADMIN_DEACTIVATED_NOTE]
      );
    }

    await this.activityLog.log("key.revoked", { serialId, userId: key.assignedTo ?? null }, { adminId });
    return saved;
  }

  async restoreRevokedKey(serialId: number, adminId?: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    if (!["revoked", "deactivated"].includes(key.status)) {
      throw new BadRequestException("Only revoked keys can be restored");
    }

    key.status = key.assignedTo ? "used" : "assigned";
    const saved = await this.keys.save(key);

    if (key.assignedTo) {
      await this.keys.query(
        `UPDATE users
         SET account_status = 'active', deleted_at = NULL, updated_at = NOW()
         WHERE user_id = $1`,
        [key.assignedTo]
      );
    }

    await this.activityLog.log("key.restored", { serialId, userId: key.assignedTo ?? null }, { adminId });
    return saved;
  }

  async deactivate(serialId: number, adminId?: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    key.status = "deactivated";
    const saved = await this.keys.save(key);
    await this.activityLog.log("key.deactivated", { serialId }, { adminId });
    return saved;
  }

  async deactivateForActor(actor: ScopedActor, serialId: number) {
    if (!isSuperAdmin(actor.role)) {
      const keyRows = (await this.keys.query(
        `SELECT serial_id, company, department FROM serial_keys WHERE serial_id = $1 LIMIT 1`,
        [serialId],
      )) as Array<{ serial_id: number; company: string | null; department: string | null }>;
      await this.adminScope.assertRecordInScope(
        actor,
        keyRows[0] ?? {},
        "You can only deactivate keys in your assigned department.",
      );
    }

    return this.deactivate(serialId, resolveActorId(actor));
  }

  async generateBulk(count: number, options: GenerateOptions = {}) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(await this.generate(options));
    }
    return items;
  }

  async activateAtomic(serialKey: string, userId: number) {
    return this.keys.manager.transaction(async (manager) => {
      const rows = await manager.query(
        `SELECT serial_id, status, expires_at, duration_days FROM serial_keys
         WHERE serial_key = $1 FOR UPDATE`,
        [serialKey]
      );
      const key = rows[0] as {
        serial_id: number;
        status: string;
        expires_at: Date | null;
        duration_days: number | null;
      } | undefined;
      if (!key) throw new BadRequestException("Invalid serial key");
      if (key.status !== "unused" && key.status !== "assigned") {
        throw new BadRequestException(`Serial key is ${key.status}`);
      }
      if (key.expires_at && new Date(key.expires_at) < new Date()) {
        throw new BadRequestException("Serial key has expired");
      }

      const expiresAt =
        key.expires_at ??
        (key.duration_days ? this.resolveExpiresAt(key.duration_days) : null);

      await manager.query(
        `UPDATE serial_keys
         SET status = 'used', assigned_to = $1, used_at = NOW(), expires_at = COALESCE(expires_at, $3::timestamp)
         WHERE serial_id = $2`,
        [userId, key.serial_id, expiresAt],
      );
      await manager.query(`UPDATE users SET serial_key = $1 WHERE user_id = $2`, [
        serialKey,
        userId
      ]);

      const scopeRows = (await manager.query(
        `SELECT company, department FROM users WHERE user_id = $1 LIMIT 1`,
        [userId],
      )) as Array<{ company: string | null; department: string | null }>;

      const updated = await manager.findOne(SerialKeyEntity, {
        where: { serialId: key.serial_id }
      });

      this.notifications.emitKeyUsed({
        serialKey,
        userId,
        company: scopeRows[0]?.company ?? null,
        department: scopeRows[0]?.department ?? null,
      });
      await this.activityLog.log("key.activated", { serialKey, userId }, { userId });

      return updated;
    });
  }

  async validateUnused(serialKey: string) {
    const key = await this.keys.findOne({ where: { serialKey } });
    if (!key) throw new BadRequestException("Invalid serial key");
    if (key.status !== "unused" && key.status !== "assigned") {
      throw new BadRequestException(`Serial key is ${key.status}`);
    }
    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new BadRequestException("Serial key has expired");
    }
    return key;
  }

  async createRevocationRequest(
    data: { requestType: "key" | "device"; targetId: number; reason?: string },
    adminId?: number
  ) {
    if (data.requestType === "key") {
      const key = await this.keys.findOne({ where: { serialId: data.targetId } });
      if (!key) throw new BadRequestException("Serial key not found");
      if (["revoked", "deactivated"].includes(key.status)) {
        throw new BadRequestException(`Serial key is already ${key.status}`);
      }
    } else {
      const rows = (await this.keys.query(
        `SELECT device_id, status FROM devices WHERE device_id = $1 LIMIT 1`,
        [data.targetId]
      )) as Array<{ device_id: number; status: string }>;
      const device = rows[0];
      if (!device) throw new BadRequestException("Device not found");
      if (["unauthorized", "inactive"].includes(device.status)) {
        throw new BadRequestException(`Device is already ${device.status}`);
      }
    }

    const existing = (await this.keys.query(
      `SELECT request_id
       FROM revocation_requests
       WHERE request_type = $1
         AND target_id = $2
         AND status = 'pending'
       LIMIT 1`,
      [data.requestType, data.targetId]
    )) as Array<{ request_id: number }>;

    if (existing[0]?.request_id) {
      throw new BadRequestException("A pending revocation request already exists");
    }

    const rows = (await this.keys.query(
      `INSERT INTO revocation_requests (request_type, target_id, reason, requested_by)
       VALUES ($1, $2, $3, $4)
       RETURNING request_id AS "requestId", request_type AS "requestType", target_id AS "targetId", status, created_at AS "createdAt"`,
      [data.requestType, data.targetId, data.reason?.trim() || null, adminId ?? null]
    )) as Array<Record<string, unknown>>;

    await this.activityLog.log(
      "revocation.requested",
      {
        requestId: rows[0]?.requestId,
        requestType: data.requestType,
        targetId: data.targetId,
        reason: data.reason?.trim() || null
      },
      { adminId }
    );

    return rows[0];
  }

  async approveRevocationRequest(requestId: number, adminId?: number) {
    const rows = (await this.keys.query(
      `SELECT request_id, request_type, target_id, status
       FROM revocation_requests
       WHERE request_id = $1
       LIMIT 1`,
      [requestId]
    )) as Array<{ request_id: number; request_type: "key" | "device"; target_id: number; status: string }>;

    const request = rows[0];
    if (!request) throw new BadRequestException("Revocation request not found");
    if (request.status !== "pending") {
      throw new BadRequestException(`Revocation request is already ${request.status}`);
    }

    if (request.request_type === "key") {
      await this.revoke(request.target_id, adminId);
    } else {
      await this.keys.query(
        `UPDATE devices SET status = 'inactive', warning_note = $2, last_seen = NOW() WHERE device_id = $1`,
        [request.target_id, ADMIN_DEACTIVATED_NOTE]
      );
      await this.activityLog.log(
        "device.flagged_inactive",
        { deviceId: request.target_id, requestId },
        { adminId }
      );
    }

    await this.keys.query(
      `UPDATE revocation_requests
       SET status = 'approved', resolved_by = $2, resolved_at = NOW()
       WHERE request_id = $1`,
      [requestId, adminId ?? null]
    );

    await this.activityLog.log(
      "revocation.approved",
      { requestId, requestType: request.request_type, targetId: request.target_id },
      { adminId }
    );

    return { success: true, requestId };
  }

  async findRevocationRequestsForAdmin(adminId: number) {
    try {
      return (await this.keys.query(
        `SELECT
          rr.request_id AS "requestId",
          rr.request_type AS "requestType",
          rr.target_id AS "targetId",
          rr.status,
          rr.created_at AS "createdAt",
          COALESCE(sk.serial_key, d.serial_number, d.device_name, 'Device #' || d.device_id::text) AS "referenceId"
        FROM revocation_requests rr
        LEFT JOIN serial_keys sk ON rr.request_type = 'key' AND sk.serial_id = rr.target_id
        LEFT JOIN devices d ON rr.request_type = 'device' AND d.device_id = rr.target_id
        WHERE rr.requested_by = $1
        ORDER BY rr.created_at DESC`,
        [adminId]
      )) as Array<Record<string, unknown>>;
    } catch {
      return [];
    }
  }

  async cancelRevocationRequest(requestId: number, adminId: number) {
    const rows = (await this.keys.query(
      `SELECT request_id, requested_by, status
       FROM revocation_requests
       WHERE request_id = $1
       LIMIT 1`,
      [requestId]
    )) as Array<{ request_id: number; requested_by: number | null; status: string }>;

    const request = rows[0];
    if (!request) throw new BadRequestException("Revocation request not found");
    if (request.status !== "pending") {
      throw new BadRequestException(`Revocation request is already ${request.status}`);
    }
    if (request.requested_by !== adminId) {
      throw new BadRequestException("You can only cancel your own revocation requests");
    }

    await this.keys.query(
      `UPDATE revocation_requests
       SET status = 'rejected', resolved_by = $2, resolved_at = NOW()
       WHERE request_id = $1`,
      [requestId, adminId]
    );

    await this.activityLog.log("revocation.cancelled", { requestId }, { adminId });
    return { success: true, requestId };
  }

  async denyRevocationRequest(requestId: number, adminId?: number) {
    const rows = (await this.keys.query(
      `SELECT request_id, status
       FROM revocation_requests
       WHERE request_id = $1
       LIMIT 1`,
      [requestId]
    )) as Array<{ request_id: number; status: string }>;

    const request = rows[0];
    if (!request) throw new BadRequestException("Revocation request not found");
    if (request.status !== "pending") {
      throw new BadRequestException(`Revocation request is already ${request.status}`);
    }

    await this.keys.query(
      `UPDATE revocation_requests
       SET status = 'rejected', resolved_by = $2, resolved_at = NOW()
       WHERE request_id = $1`,
      [requestId, adminId ?? null]
    );

    await this.activityLog.log("revocation.denied", { requestId }, { adminId });
    return { success: true, requestId };
  }
}
