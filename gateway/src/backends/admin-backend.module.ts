import { Module } from "@nestjs/common";
import { ActivityLogsModule } from "../modules/activity-logs/activity-logs.module";
import { AuthModule } from "../modules/auth/auth.module";
import { DevicesModule } from "../modules/devices/devices.module";
import { KeysModule } from "../modules/keys/keys.module";
import { ReportsModule } from "../modules/reports/reports.module";
import { UserConcernsModule } from "../modules/user-concerns/user-concerns.module";
import { UsersModule } from "../modules/users/users.module";
import { CoreModule } from "../core/core.module";

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    KeysModule,
    DevicesModule,
    ReportsModule,
    ActivityLogsModule,
    UserConcernsModule,
  ]
})
export class AdminBackendModule {}
