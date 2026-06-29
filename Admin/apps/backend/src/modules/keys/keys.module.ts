import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { SerialKeyEntity } from "./entities/key.entity";
import { KeysController } from "./keys.controller";
import { KeysService } from "./keys.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([SerialKeyEntity], "online"),
    NotificationsModule
  ],
  controllers: [KeysController],
  providers: [KeysService, ActivityLogService],
  exports: [KeysService]
})
export class KeysModule {}
