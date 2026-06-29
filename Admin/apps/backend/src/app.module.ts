import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { buildOnlineDatabaseConfig } from "./database/database.config";
import { ActivityLogsModule } from "./modules/activity-logs/activity-logs.module";
import { AdminsModule } from "./modules/admins/admins.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BackupModule } from "./modules/backup/backup.module";
import { CloudModule } from "./modules/cloud/cloud.module";
import { SystemConfigModule } from "./modules/config/config.module";
import { DevicesModule } from "./modules/devices/devices.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { KeysModule } from "./modules/keys/keys.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { SchedulesModule } from "./modules/schedules/schedules.module";
import { SyncModule } from "./modules/sync/sync.module";
import { RolesModule } from "./modules/roles/roles.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, "..", ".env"),
        join(process.cwd(), "apps", "backend", ".env"),
        join(process.cwd(), ".env")
      ]
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    TypeOrmModule.forRootAsync({
      name: "online",
      inject: [ConfigService],
      useFactory: (config: ConfigService) => buildOnlineDatabaseConfig(config)
    }),
    AuthModule,
    UsersModule,
    KeysModule,
    DevicesModule,
    DocumentsModule,
    ActivityLogsModule,
    ReportsModule,
    AdminsModule,
    CloudModule,
    BackupModule,
    SystemConfigModule,
    NotificationsModule,
    SyncModule,
    RolesModule,
    SchedulesModule
  ]
})
export class AppModule {}
