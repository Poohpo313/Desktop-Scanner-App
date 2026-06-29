import { Module } from "@nestjs/common";
import { ConfigController } from "./config.controller";
import { SystemConfigService } from "./config.service";

@Module({ controllers: [ConfigController], providers: [SystemConfigService] })
export class SystemConfigModule {}
