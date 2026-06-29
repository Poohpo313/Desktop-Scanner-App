import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedScopeModule } from "../../shared/shared-scope.module";
import { AdminsModule } from "../admins/admins.module";
import { UserEntity } from "../users/entities/user.entity";
import { UserConcernsController } from "./user-concerns.controller";
import { UserConcernsService } from "./user-concerns.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity], "online"), AdminsModule, SharedScopeModule],
  controllers: [UserConcernsController],
  providers: [UserConcernsService],
  exports: [UserConcernsService]
})
export class UserConcernsModule {}
