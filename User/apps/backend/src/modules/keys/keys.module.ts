import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SerialKeyEntity } from "./entities/key.entity";
import { KeysController } from "./keys.controller";
import { KeysService } from "./keys.service";

@Module({
  imports: [TypeOrmModule.forFeature([SerialKeyEntity], "online")],
  controllers: [KeysController],
  providers: [KeysService],
  exports: [KeysService]
})
export class KeysModule {}
