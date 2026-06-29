import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLogService } from "../../shared/services/activity-log.service";
import { SharedScopeModule } from "../../shared/shared-scope.module";
import { AdminsModule } from "../admins/admins.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { SerialKeyEntity } from "./entities/key.entity";
import { KeysController } from "./keys.controller";
import { KeysService } from "./keys.service";
import { KeyExtensionService } from "./key-extension.service";
import { UserKeysController } from "./user-keys.controller";
import { AdminKeyRequestsController } from "./admin-key-requests.controller";
import { SuperAdminKeyRequestsController } from "./superadmin-key-requests.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([SerialKeyEntity], "online"),
    NotificationsModule,
    AdminsModule,
    SharedScopeModule,
  ],
  controllers: [
    KeysController,
    UserKeysController,
    AdminKeyRequestsController,
    SuperAdminKeyRequestsController,
  ],
  providers: [KeysService, KeyExtensionService, ActivityLogService],
  exports: [KeysService, KeyExtensionService]
})
export class KeysModule {}
