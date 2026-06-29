import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { v4 as uuidv4 } from "uuid";
import { Repository } from "typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { SerialKeyEntity } from "./entities/key.entity";

@Injectable()
export class KeysService {
  constructor(
    @InjectRepository(SerialKeyEntity, "online")
    private readonly keys: Repository<SerialKeyEntity>,
    private readonly activityLog: ActivityLogService,
    private readonly notifications: NotificationsGateway
  ) {}

  generateKey(): string {
    return uuidv4();
  }

  async generate(adminId?: number) {
    const entity = this.keys.create({
      serialKey: this.generateKey(),
      status: "unused",
      assignedAdmin: adminId
    });
    const saved = await this.keys.save(entity);
    await this.activityLog.log("key.generated", { serialId: saved.serialId }, { adminId });
    return saved;
  }

  findAll() {
    return this.keys.find({ order: { generatedAt: "DESC" } });
  }

  async assign(serialId: number, userId: number, adminId?: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    if (key.status !== "unused" && key.status !== "assigned") {
      throw new BadRequestException(`Serial key is ${key.status}`);
    }
    key.assignedTo = userId;
    key.status = "assigned";
    const saved = await this.keys.save(key);
    await this.activityLog.log("key.assigned", { serialId, userId }, { adminId });
    return saved;
  }

  async revoke(serialId: number, adminId?: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    key.status = "revoked";
    const saved = await this.keys.save(key);
    await this.activityLog.log("key.revoked", { serialId }, { adminId });
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

  async generateBulk(count: number, adminId?: number) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(await this.generate(adminId));
    }
    return items;
  }

  async activateAtomic(serialKey: string, userId: number) {
    return this.keys.manager.transaction(async (manager) => {
      const rows = await manager.query(
        `SELECT serial_id, status FROM serial_keys
         WHERE serial_key = $1 FOR UPDATE`,
        [serialKey]
      );
      const key = rows[0] as { serial_id: number; status: string } | undefined;
      if (!key) throw new BadRequestException("Invalid serial key");
      if (key.status !== "unused" && key.status !== "assigned") {
        throw new BadRequestException(`Serial key is ${key.status}`);
      }

      await manager.query(
        `UPDATE serial_keys
         SET status = 'used', assigned_to = $1, used_at = NOW()
         WHERE serial_id = $2`,
        [userId, key.serial_id]
      );

      const updated = await manager.findOne(SerialKeyEntity, {
        where: { serialId: key.serial_id }
      });

      this.notifications.emitKeyUsed({ serialKey, userId });
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
    return key;
  }
}
