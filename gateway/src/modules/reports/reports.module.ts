import { Module } from "@nestjs/common";
import { AdminsModule } from "../admins/admins.module";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [AdminsModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}