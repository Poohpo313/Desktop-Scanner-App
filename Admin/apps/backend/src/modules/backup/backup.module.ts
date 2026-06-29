import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { BackupEntity } from "./entities/backup.entity";
import { BackupController } from "./backup.controller";
import { BackupService } from "./backup.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([BackupEntity], "online"),
    NotificationsModule
  ],
  controllers: [BackupController],
  providers: [BackupService, ActivityLogService],
  exports: [BackupService]
})
export class BackupModule {}
