import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Repository } from "typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { aesDecrypt, aesEncrypt } from "../../shared/utils/aes-encrypt.util";
import { sha256FromBuffer } from "../../shared/utils/sha256.util";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { BackupEntity } from "./entities/backup.entity";

@Injectable()
export class BackupService {
  constructor(
    @InjectRepository(BackupEntity, "online")
    private readonly backups: Repository<BackupEntity>,
    private readonly config: ConfigService,
    private readonly activityLog: ActivityLogService,
    private readonly notifications: NotificationsGateway
  ) {}

  private backupDir() {
    const dir = this.config.get<string>("BACKUP_PATH", "./backups");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  private encryptionKey() {
    return this.config.get<string>("BACKUP_ENCRYPTION_KEY", "");
  }

  getHistory() {
    return this.backups.find({ order: { createdAt: "DESC" } });
  }

  async manual(triggeredBy?: number) {
    const history = await this.backups.count();
    const version = `v${history + 1}`;
    const dir = this.backupDir();
    const rawPath = join(dir, `${version}-${Date.now()}.json`);
    const encPath = `${rawPath}.enc`;

    const payload = {
      version,
      exportedAt: new Date().toISOString(),
      tables: ["users", "admins", "serial_keys", "documents", "devices"]
    };
    writeFileSync(rawPath, JSON.stringify(payload));
    const raw = readFileSync(rawPath);
    const encrypted = aesEncrypt(raw.toString("utf8"), this.encryptionKey());
    writeFileSync(encPath, encrypted);

    const record = this.backups.create({
      version,
      filePath: encPath,
      checksumSha256: sha256FromBuffer(Buffer.from(encrypted)),
      sizeBytes: String(Buffer.byteLength(encrypted)),
      encrypted: true,
      status: "completed",
      triggeredBy
    });
    const saved = await this.backups.save(record);
    await this.activityLog.log("backup.manual", { backupId: saved.backupId }, { adminId: triggeredBy });
    this.notifications.emitBackupComplete({ backupId: saved.backupId, version });
    return { ...saved, status: "started" };
  }

  async restore(id: string, adminId?: number) {
    const backup = await this.backups.findOne({ where: { backupId: Number(id) } });
    if (!backup) throw new NotFoundException("Backup not found");
    if (!existsSync(backup.filePath)) throw new NotFoundException("Backup file missing");

    const encrypted = readFileSync(backup.filePath, "utf8");
    aesDecrypt(encrypted, this.encryptionKey());

    backup.restoredAt = new Date();
    await this.backups.save(backup);
    await this.activityLog.log("backup.restored", { backupId: backup.backupId }, { adminId });
    return { id, status: "restored" };
  }

  async delete(id: string, adminId?: number) {
    const backup = await this.backups.findOne({ where: { backupId: Number(id) } });
    if (!backup) throw new NotFoundException("Backup not found");
    await this.backups.delete({ backupId: backup.backupId });
    await this.activityLog.log("backup.deleted", { backupId: backup.backupId }, { adminId });
    return { id, deleted: true };
  }
}
