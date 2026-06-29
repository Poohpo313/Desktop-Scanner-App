import { Module } from "@nestjs/common";
import { ActivityLogsModule } from "../modules/activity-logs/activity-logs.module";
import { AdminsModule } from "../modules/admins/admins.module";
import { AuthModule } from "../modules/auth/auth.module";
import { BackupModule } from "../modules/backup/backup.module";
import { CloudModule } from "../modules/cloud/cloud.module";
import { SystemConfigModule } from "../modules/config/config.module";
import { DevicesModule } from "../modules/devices/devices.module";
import { DocumentsModule } from "../modules/documents/documents.module";
import { KeysModule } from "../modules/keys/keys.module";
import { NotificationsModule } from "../modules/notifications/notifications.module";
import { ReportsModule } from "../modules/reports/reports.module";
import { RolesModule } from "../modules/roles/roles.module";
import { SchedulesModule } from "../modules/schedules/schedules.module";
import { SyncModule } from "../modules/sync/sync.module";
import { UsersModule } from "../modules/users/users.module";
import { UserConcernsModule } from "../modules/user-concerns/user-concerns.module";
import { HealthModule } from "../modules/health/health.module";
import { CoreModule } from "../core/core.module";

/**
 * Unified connector — mounts Admin, SuperAdmin, and User online APIs together.
 * All routes share /api/v1 and the online PostgreSQL database.
 */
@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    AdminsModule,
    KeysModule,
    DevicesModule,
    DocumentsModule,
    SyncModule,
    CloudModule,
    BackupModule,
    SystemConfigModule,
    RolesModule,
    ReportsModule,
    ActivityLogsModule,
    UserConcernsModule,
    NotificationsModule,
    SchedulesModule,
    HealthModule
  ]
})
export class GatewayModule {}
