import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { AdminsController } from "./admins.controller";
import { AdminsService } from "./admins.service";
import { AdminEntity } from "./entities/admin.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity], "online")],
  controllers: [AdminsController],
  providers: [AdminsService, ActivityLogService],
  exports: [AdminsService]
})
export class AdminsModule {}
