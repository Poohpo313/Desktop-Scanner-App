import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ActivityLogArchiveService } from "../activity-logs/activity-log-archive.service";
import { AdminsService } from "../admins/admins.service";
import { BackupService } from "../backup/backup.service";
import { SystemConfigService } from "../config/config.service";
import { DevicesService } from "../devices/devices.service";
import { KeyExtensionService } from "../keys/key-extension.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class MaintenanceScheduler {
  private readonly logger = new Logger(MaintenanceScheduler.name);

  constructor(
    private readonly backup: BackupService,
    private readonly config: SystemConfigService,
    private readonly devices: DevicesService,
    private readonly users: UsersService,
    private readonly admins: AdminsService,
    private readonly activityLogArchive: ActivityLogArchiveService,
    private readonly keyExtension: KeyExtensionService,
  ) {}

  @Cron("0 0 * * *")
  async archiveDailyLogs() {
    const result = await this.activityLogArchive.archiveAndReset();
    if (result.archived > 0) {
      this.logger.log(`Daily log archive complete: ${result.archived} entries -> ${result.file}`);
    }
  }

  @Cron("0 2 * * *")
  async dailyBackup() {
    const settings = await this.config.get();
    if (settings.backupDailyEnabled === false) return;
    await this.backup.manual();
    this.logger.log("Daily backup completed");
  }

  @Cron("0 4 * * *")
  async purgeDeletedProfiles() {
    await this.users.purgeDeletedOlderThan(30);
    await this.admins.purgeDeletedOlderThan(30);
  }

  @Cron("*/10 * * * *")
  async detectInactiveDevices() {
    await this.devices.detectInactiveDevices();
  }

  @Cron("0 8 * * *")
  async notifyKeyExpiryMilestones() {
    await this.keyExtension.runExpiryNotifications();
  }
}
