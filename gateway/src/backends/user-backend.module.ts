import { Module } from "@nestjs/common";
import { AuthModule } from "../modules/auth/auth.module";
import { DevicesModule } from "../modules/devices/devices.module";
import { DocumentsModule } from "../modules/documents/documents.module";
import { KeysModule } from "../modules/keys/keys.module";
import { SyncModule } from "../modules/sync/sync.module";
import { CoreModule } from "../core/core.module";

/** User online sync API — PostgreSQL + local disk storage (not cloud bucket). */
@Module({
  imports: [
    CoreModule,
    AuthModule,
    SyncModule,
    DevicesModule,
    DocumentsModule,
    KeysModule
  ]
})
export class UserBackendModule {}
