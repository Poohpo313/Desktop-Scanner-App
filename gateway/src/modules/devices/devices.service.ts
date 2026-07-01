import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import {
  appendDepartmentScope,
  isSuperAdmin,
  resolveActorId,
  type ScopedActor,
} from "../../shared/admin-scope";
import type { PaginationInput } from "../../shared/pagination";
import { queryScopedList } from "../../shared/scoped-query";
import { AdminScopeService } from "../../shared/services/admin-scope.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { DeviceEntity } from "./entities/device.entity";

const HEARTBEAT_TIMEOUT_MINUTES = 3;
const UNAUTHORIZED_DEVICE_NOTE = "Unauthorized Device";
const ADMIN_DEACTIVATED_NOTE = "Device deactivated by administrator";

const DEVICE_LIST_SELECT = `
  SELECT
    d.device_id AS "deviceId",
    d.device_name AS "deviceName",
    d.device_type AS "deviceType",
    d.serial_number AS "serialNumber",
    d.status,
    d.assigned_user AS "assignedUser",
    d.last_seen AS "lastSeen",
    d.is_primary AS "isPrimary",
    d.parent_device_id AS "parentDeviceId",
    d.warning_note AS "warningNote",
    parent.device_name AS "parentDeviceName",
    NULLIF(
      TRIM(
        COALESCE(
          (
            SELECT sk.serial_key
            FROM serial_keys sk
            WHERE sk.assigned_to = u.user_id
            ORDER BY sk.serial_id DESC
            LIMIT 1
          ),
          u.serial_key
        )
      ),
      ''
    ) AS "licenseSerialKey",
    (
      d.status = 'active'
      AND d.last_seen IS NOT NULL
      AND d.last_seen >= NOW() - ($1 || ' minutes')::interval
      AND COALESCE(u.account_status, '') = 'active'
    ) AS "isOnline"
  FROM devices d
  LEFT JOIN users u ON u.user_id = d.assigned_user
  LEFT JOIN devices parent ON parent.device_id = d.parent_device_id`;

const DEVICE_LIST_WHERE = `
  WHERE d.device_type = 'workstation'
    AND (u.user_id IS NULL OR u.account_status <> 'deleted')
    AND (
      d.status IN ('active', 'inactive')
      OR (d.status = 'unauthorized' AND d.warning_note = '${UNAUTHORIZED_DEVICE_NOTE}')
    )`;

const DEVICE_LIST_ORDER = `
  ORDER BY
    COALESCE(d.parent_device_id, d.device_id),
    d.is_primary DESC,
    d.last_seen DESC NULLS LAST`;

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity, "online")
    private readonly devices: Repository<DeviceEntity>,
    private readonly activityLog: ActivityLogService,
    private readonly notifications: NotificationsGateway,
    private readonly adminScope: AdminScopeService,
  ) {}

  findAll() {
    return this.detectInactiveDevices().then(() =>
      this.devices.query(
        `${DEVICE_LIST_SELECT}
        ${DEVICE_LIST_WHERE}
        ${DEVICE_LIST_ORDER}`,
        [HEARTBEAT_TIMEOUT_MINUTES],
      ),
    );
  }

  async findAllForActor(actor: ScopedActor, pagination?: PaginationInput) {
    if (isSuperAdmin(actor.role)) {
      return queryScopedList(this.devices, {
        baseSql: `${DEVICE_LIST_SELECT}
        ${DEVICE_LIST_WHERE}`,
        params: [HEARTBEAT_TIMEOUT_MINUTES],
        orderSql: DEVICE_LIST_ORDER,
        pagination,
        beforeQuery: () => this.detectInactiveDevices().then(() => undefined),
      });
    }

    const scope = await this.adminScope.resolveScope(actor);
    if (!scope?.company || !scope.department) return [];

    const params: unknown[] = [HEARTBEAT_TIMEOUT_MINUTES, scope.company];
    const scopedSql = appendDepartmentScope(
      `${DEVICE_LIST_SELECT}
        ${DEVICE_LIST_WHERE}
          AND LOWER(TRIM(COALESCE(u.company, ''))) = LOWER(TRIM($2))`,
      scope,
      "u.department",
      params,
      { requireDepartments: true },
    );

    return queryScopedList(this.devices, {
      baseSql: scopedSql,
      params,
      orderSql: DEVICE_LIST_ORDER,
      pagination,
      beforeQuery: () => this.detectInactiveDevices().then(() => undefined),
    });
  }

  findRecycleBin() {
    return this.devices.find({
      where: { deviceType: "workstation", status: "inactive" },
      order: { lastSeen: "DESC" }
    });
  }

  private async resolveAssignedUserId(data: {
    assignedUser?: number;
    username?: string;
  }) {
    if (data.username?.trim()) {
      const rows = (await this.devices.query(
        `SELECT user_id
         FROM users
         WHERE LOWER(username) = LOWER($1)
           AND account_status <> 'deleted'
         LIMIT 1`,
        [data.username.trim()]
      )) as Array<{ user_id: number }>;

      if (rows[0]?.user_id) return rows[0].user_id;
    }

    if (data.assignedUser) {
      const rows = (await this.devices.query(
        `SELECT user_id FROM users WHERE user_id = $1 AND account_status <> 'deleted' LIMIT 1`,
        [data.assignedUser]
      )) as Array<{ user_id: number }>;

      if (rows[0]?.user_id) return rows[0].user_id;
    }

    throw new BadRequestException("Assigned user not found");
  }

  private async findPrimaryDeviceForUser(userId: number) {
    return this.devices.findOne({
      where: {
        assignedUser: userId,
        deviceType: "workstation",
        isPrimary: true,
      },
    });
  }

  private async assertDeviceOwnedByUser(serialNumber: string, userId: number) {
    const device = await this.devices.findOne({ where: { serialNumber } });
    if (!device) throw new NotFoundException("Device not found");
    if (device.assignedUser !== userId) {
      throw new ForbiddenException("Device is not assigned to this account");
    }
    return device;
  }

  async register(
    data: {
      deviceName?: string;
      deviceType?: string;
      serialNumber: string;
      assignedUser?: number;
      username?: string;
    },
    authenticatedUserId?: number,
  ) {
    const serialNumber = data.serialNumber.trim();
    if (!serialNumber.startsWith("ws-") || data.deviceType !== "workstation") {
      throw new BadRequestException("Only app workstation devices can be registered");
    }

    const assignedUser = authenticatedUserId ?? (await this.resolveAssignedUserId(data));
    if (authenticatedUserId && assignedUser !== authenticatedUserId) {
      throw new ForbiddenException("You can only register devices for your own account");
    }

    const existing = await this.devices.findOne({
      where: { serialNumber }
    });
    if (existing) {
      existing.lastSeen = new Date();
      existing.assignedUser = assignedUser;
      if (data.deviceName) existing.deviceName = data.deviceName;
      if (data.deviceType) existing.deviceType = data.deviceType;

      if (existing.warningNote === UNAUTHORIZED_DEVICE_NOTE) {
        existing.status = "unauthorized";
      } else {
        existing.status = "active";
        if (existing.warningNote === ADMIN_DEACTIVATED_NOTE) {
          existing.warningNote = null;
        }
      }

      const saved = await this.devices.save(existing);
      return this.toRegisterResponse(saved);
    }

    const primary = await this.findPrimaryDeviceForUser(assignedUser);
    if (!primary) {
      const device = this.devices.create({
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        serialNumber,
        assignedUser,
        status: "active",
        isPrimary: true,
        parentDeviceId: null,
        warningNote: null,
        lastSeen: new Date(),
      });
      const saved = await this.devices.save(device);
      await this.activityLog.log(
        "device.registered",
        { deviceId: saved.deviceId, isPrimary: true },
        { userId: assignedUser },
      );
      return this.toRegisterResponse(saved);
    }

    const device = this.devices.create({
      deviceName: data.deviceName,
      deviceType: data.deviceType,
      serialNumber,
      assignedUser,
      status: "unauthorized",
      isPrimary: false,
      parentDeviceId: primary.deviceId,
      warningNote: UNAUTHORIZED_DEVICE_NOTE,
      lastSeen: new Date(),
    });
    const saved = await this.devices.save(device);
    const owner = await this.resolveDeviceOwnerScope(assignedUser);
    await this.activityLog.log(
      "device.unauthorized_detected",
      {
        deviceId: saved.deviceId,
        parentDeviceId: primary.deviceId,
        warningNote: UNAUTHORIZED_DEVICE_NOTE,
      },
      { userId: assignedUser },
    );
    this.notifications.emitDeviceHeartbeat({
      deviceId: saved.deviceId,
      serialNumber,
      userId: assignedUser,
      warningNote: UNAUTHORIZED_DEVICE_NOTE,
      parentDeviceId: primary.deviceId,
      ...owner,
    });
    return this.toRegisterResponse(saved);
  }

  private toRegisterResponse(device: DeviceEntity) {
    return {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      serialNumber: device.serialNumber,
      assignedUser: device.assignedUser,
      status: device.status,
      isPrimary: device.isPrimary,
      parentDeviceId: device.parentDeviceId,
      warningNote: device.warningNote,
      lastSeen: device.lastSeen,
    };
  }

  async heartbeat(serialNumber: string, userId: number) {
    const device = await this.assertDeviceOwnedByUser(serialNumber, userId);
    device.lastSeen = new Date();

    const adminDeactivated =
      device.status === "inactive" && device.warningNote === ADMIN_DEACTIVATED_NOTE;
    if (adminDeactivated) {
      const saved = await this.devices.save(device);
      return { success: true, deviceId: saved.deviceId, status: saved.status };
    }

    if (device.warningNote === UNAUTHORIZED_DEVICE_NOTE) {
      device.status = "unauthorized";
    } else {
      device.status = "active";
      device.warningNote = null;
    }
    const saved = await this.devices.save(device);
    const owner = await this.resolveDeviceOwnerScope(saved.assignedUser);
    this.notifications.emitDeviceHeartbeat({
      deviceId: saved.deviceId,
      serialNumber,
      userId,
      warningNote: saved.warningNote,
      parentDeviceId: saved.parentDeviceId,
      ...owner,
    });
    return saved;
  }

  private async resolveDeviceOwnerScope(userId?: number | null) {
    if (!userId) return { company: null, department: null };
    const rows = (await this.devices.query(
      `SELECT company, department FROM users WHERE user_id = $1 LIMIT 1`,
      [userId],
    )) as Array<{ company: string | null; department: string | null }>;
    return rows[0] ?? { company: null, department: null };
  }

  async disconnect(serialNumber: string, userId: number) {
    const normalized = serialNumber.trim();
    if (!normalized) return { success: true };

    const device = await this.assertDeviceOwnedByUser(normalized, userId);

    // Mark presence offline without changing registration status (inactive = admin "allow new device").
    device.lastSeen = new Date(
      Date.now() - (HEARTBEAT_TIMEOUT_MINUTES + 1) * 60 * 1000,
    );
    await this.devices.save(device);
    const owner = await this.resolveDeviceOwnerScope(device.assignedUser);
    this.notifications.emitDeviceInactive({
      deviceId: device.deviceId,
      serialNumber: normalized,
      userId: device.assignedUser,
      ...owner,
    });
    return { success: true };
  }

  async restoreFromRecycle(id: number) {
    const device = await this.devices.findOne({ where: { deviceId: id } });
    if (!device || device.status !== "inactive") {
      throw new NotFoundException("Deleted device not found");
    }
    device.status = "active";
    device.lastSeen = new Date();
    return this.devices.save(device);
  }

  async flagInactiveForActor(actor: ScopedActor, id: number) {
    if (!isSuperAdmin(actor.role)) {
      const rows = (await this.devices.query(
        `SELECT u.company, u.department
         FROM devices d
         LEFT JOIN users u ON u.user_id = d.assigned_user
         WHERE d.device_id = $1
         LIMIT 1`,
        [id],
      )) as Array<{ company: string | null; department: string | null }>;
      await this.adminScope.assertRecordInScope(
        actor,
        rows[0] ?? {},
        "You can only deactivate devices in your assigned department.",
      );
    }

    return this.flagInactive(id, resolveActorId(actor));
  }

  async flagInactive(id: number, adminId?: number) {
    const device = await this.devices.findOne({ where: { deviceId: id } });
    if (!device) throw new NotFoundException("Device not found");
    device.status = "inactive";
    device.warningNote = ADMIN_DEACTIVATED_NOTE;
    const saved = await this.devices.save(device);
    await this.activityLog.log("device.flagged_inactive", { deviceId: id }, { adminId });
    return saved;
  }

  async revoke(id: number, adminId?: number) {
    const device = await this.devices.findOne({ where: { deviceId: id } });
    if (!device) throw new NotFoundException("Device not found");
    device.status = "unauthorized";
    device.warningNote = null;
    const saved = await this.devices.save(device);
    await this.activityLog.log("device.revoked", { deviceId: id, reason: "Unauthorized Device" }, { adminId });
    return saved;
  }

  async permanentDelete(id: number, adminId?: number) {
    const device = await this.devices.findOne({ where: { deviceId: id } });
    if (!device) throw new NotFoundException("Device not found");
    if (!["unauthorized", "inactive"].includes(device.status)) {
      throw new NotFoundException("Only revoked devices can be permanently removed");
    }
    await this.devices.query(
      `DELETE FROM revocation_requests WHERE request_type = 'device' AND target_id = $1`,
      [id],
    );
    await this.devices.delete({ deviceId: id });
    await this.activityLog.log("device.permanently_deleted", { deviceId: id }, { adminId });
    return { success: true };
  }

  async detectInactiveDevices() {
    await this.devices.query(
      `UPDATE devices d
       SET status = 'active', warning_note = NULL
       WHERE d.device_type = 'workstation'
         AND d.status = 'inactive'
         AND (d.warning_note IS NULL OR d.warning_note <> $2)
         AND d.last_seen IS NOT NULL
         AND d.last_seen >= NOW() - ($1 || ' minutes')::interval`,
      [HEARTBEAT_TIMEOUT_MINUTES, ADMIN_DEACTIVATED_NOTE],
    );

    const stale = (await this.devices.query(
      `SELECT d.device_id, d.serial_number, d.assigned_user, u.company, u.department
       FROM devices d
       LEFT JOIN users u ON u.user_id = d.assigned_user
       WHERE d.status = 'active'
         AND d.device_type = 'workstation'
         AND d.last_seen IS NOT NULL
         AND d.last_seen < NOW() - ($1 || ' minutes')::interval`,
      [HEARTBEAT_TIMEOUT_MINUTES]
    )) as Array<{
      device_id: number;
      serial_number: string;
      assigned_user: number | null;
      company: string | null;
      department: string | null;
    }>;

    if (stale.length > 0) {
      for (const device of stale) {
        this.notifications.emitDeviceInactive({
          deviceId: device.device_id,
          serialNumber: device.serial_number,
          userId: device.assigned_user,
          company: device.company,
          department: device.department,
        });
      }
    }

    return { flagged: stale.length };
  }

  exportCsvForActor(actor: ScopedActor, pagination?: PaginationInput) {
    return this.findAllForActor(actor, pagination);
  }

  exportCsv() {
    return this.findAll();
  }
}
