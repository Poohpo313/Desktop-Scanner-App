import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { DeviceEntity } from "./entities/device.entity";

const HEARTBEAT_TIMEOUT_MINUTES = 30;

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity, "online")
    private readonly devices: Repository<DeviceEntity>,
    private readonly activityLog: ActivityLogService,
    private readonly notifications: NotificationsGateway
  ) {}

  findAll() {
    return this.devices.find({ order: { lastSeen: "DESC" } });
  }

  async register(data: {
    deviceName?: string;
    deviceType?: string;
    serialNumber: string;
    assignedUser: number;
  }) {
    const existing = await this.devices.findOne({
      where: { serialNumber: data.serialNumber }
    });
    if (existing) {
      existing.lastSeen = new Date();
      existing.status = "active";
      return this.devices.save(existing);
    }

    const device = this.devices.create({
      ...data,
      status: "active",
      lastSeen: new Date()
    });
    const saved = await this.devices.save(device);
    await this.activityLog.log(
      "device.registered",
      { deviceId: saved.deviceId },
      { userId: data.assignedUser }
    );
    return saved;
  }

  async heartbeat(serialNumber: string, userId?: number) {
    const device = await this.devices.findOne({ where: { serialNumber } });
    if (!device) throw new NotFoundException("Device not found");
    device.lastSeen = new Date();
    device.status = "active";
    const saved = await this.devices.save(device);
    this.notifications.emitDeviceHeartbeat({
      deviceId: saved.deviceId,
      serialNumber,
      userId: userId ?? saved.assignedUser
    });
    return saved;
  }

  async flagInactive(id: number, adminId?: number) {
    const device = await this.devices.findOne({ where: { deviceId: id } });
    if (!device) throw new NotFoundException("Device not found");
    device.status = "inactive";
    const saved = await this.devices.save(device);
    await this.activityLog.log("device.flagged_inactive", { deviceId: id }, { adminId });
    return saved;
  }

  async revoke(id: number, adminId?: number) {
    const device = await this.devices.findOne({ where: { deviceId: id } });
    if (!device) throw new NotFoundException("Device not found");
    device.status = "unauthorized";
    const saved = await this.devices.save(device);
    await this.activityLog.log("device.revoked", { deviceId: id }, { adminId });
    return saved;
  }

  async detectInactiveDevices() {
    const result = await this.devices.query(
      `UPDATE devices
       SET status = 'inactive'
       WHERE status = 'active'
         AND last_seen IS NOT NULL
         AND last_seen < NOW() - ($1 || ' minutes')::interval
       RETURNING device_id, serial_number, assigned_user`,
      [HEARTBEAT_TIMEOUT_MINUTES]
    );

    const flagged = (result as unknown as [Array<Record<string, unknown>>])[0] ?? [];
    for (const device of flagged) {
      this.notifications.emitDeviceInactive(device);
    }

    return { flagged: flagged.length };
  }

  exportCsv() {
    return this.findAll();
  }
}
