import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminsModule } from "../admins/admins.module";
import { ActivityLogArchiveService } from "./activity-log-archive.service";
import { ActivityLogsController, LogsAliasController } from "./activity-logs.controller";
import { ActivityLogsService } from "./activity-logs.service";

@Module({
  imports: [ConfigModule, AdminsModule],
  controllers: [ActivityLogsController, LogsAliasController],
  providers: [ActivityLogsService, ActivityLogArchiveService],
  exports: [ActivityLogsService, ActivityLogArchiveService]
})
export class ActivityLogsModule {}
