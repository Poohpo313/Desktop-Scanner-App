import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { NotificationsModule } from "../notifications/notifications.module";
import {
  DeviceRegistrationController,
  DevicesController
} from "./devices.controller";
import { DevicesService } from "./devices.service";
import { DeviceEntity } from "./entities/device.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity], "online"),
    NotificationsModule
  ],
  controllers: [DevicesController, DeviceRegistrationController],
  providers: [DevicesService, ActivityLogService],
  exports: [DevicesService]
})
export class DevicesModule {}
