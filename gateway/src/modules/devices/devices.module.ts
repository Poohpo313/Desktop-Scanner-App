import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { SharedScopeModule } from "../../shared/shared-scope.module";
import { AdminsModule } from "../admins/admins.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { DevicesController } from "./devices.controller";
import { DevicesService } from "./devices.service";
import { DeviceEntity } from "./entities/device.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity], "online"),
    NotificationsModule,
    AdminsModule,
    SharedScopeModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService, ActivityLogService],
  exports: [DevicesService]
})
export class DevicesModule {}
