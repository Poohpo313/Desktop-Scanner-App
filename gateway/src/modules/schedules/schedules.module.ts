import { Module } from "@nestjs/common";
import { ActivityLogsModule } from "../activity-logs/activity-logs.module";
import { AdminsModule } from "../admins/admins.module";
import { BackupModule } from "../backup/backup.module";
import { SystemConfigModule } from "../config/config.module";
import { DevicesModule } from "../devices/devices.module";
import { KeysModule } from "../keys/keys.module";
import { UsersModule } from "../users/users.module";
import { MaintenanceScheduler } from "./maintenance.scheduler";

@Module({
  imports: [ActivityLogsModule, BackupModule, SystemConfigModule, DevicesModule, UsersModule, AdminsModule, KeysModule],
  providers: [MaintenanceScheduler]
})
export class SchedulesModule {}
