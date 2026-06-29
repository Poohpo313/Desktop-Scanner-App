import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { AdminsService } from "../admins/admins.service";
import { BackupService } from "../backup/backup.service";
import { DevicesService } from "../devices/devices.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class MaintenanceScheduler {
  constructor(
    private readonly backup: BackupService,
    private readonly devices: DevicesService,
    private readonly users: UsersService,
    private readonly admins: AdminsService
  ) {}

  @Cron("0 3 * * 0")
  async weeklyBackup() {
    await this.backup.manual();
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
}
