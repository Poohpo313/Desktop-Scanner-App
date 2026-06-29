import { Module } from "@nestjs/common";
import { ActivityLogsModule } from "../modules/activity-logs/activity-logs.module";
import { AdminsModule } from "../modules/admins/admins.module";
import { AuthModule } from "../modules/auth/auth.module";
import { BackupModule } from "../modules/backup/backup.module";
import { CloudModule } from "../modules/cloud/cloud.module";
import { SystemConfigModule } from "../modules/config/config.module";
import { DevicesModule } from "../modules/devices/devices.module";
import { KeysModule } from "../modules/keys/keys.module";
import { NotificationsModule } from "../modules/notifications/notifications.module";
import { ReportsModule } from "../modules/reports/reports.module";
import { RolesModule } from "../modules/roles/roles.module";
import { SchedulesModule } from "../modules/schedules/schedules.module";
import { UsersModule } from "../modules/users/users.module";
import { CoreModule } from "../core/core.module";

/** Super Admin portal API — online PostgreSQL only. */
@Module({
  imports: [
    CoreModule,
    AuthModule,
    AdminsModule,
    UsersModule,
    KeysModule,
    DevicesModule,
    CloudModule,
    BackupModule,
    SystemConfigModule,
    RolesModule,
    ReportsModule,
    ActivityLogsModule,
    NotificationsModule,
    SchedulesModule
  ]
})
export class SuperAdminBackendModule {}
