import { Module } from "@nestjs/common";
import { AdminsModule } from "../modules/admins/admins.module";
import { AdminScopeService } from "./services/admin-scope.service";

@Module({
  imports: [AdminsModule],
  providers: [AdminScopeService],
  exports: [AdminScopeService],
})
export class SharedScopeModule {}
