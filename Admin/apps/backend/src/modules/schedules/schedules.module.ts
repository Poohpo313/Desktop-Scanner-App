import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AdminsModule } from "../admins/admins.module";
import { BackupModule } from "../backup/backup.module";
import { DevicesModule } from "../devices/devices.module";
import { UsersModule } from "../users/users.module";
import { MaintenanceScheduler } from "./maintenance.scheduler";

@Module({
  imports: [
    BackupModule,
    DevicesModule,
    UsersModule,
    AdminsModule
  ],
  providers: [MaintenanceScheduler]
})
export class SchedulesModule {}
