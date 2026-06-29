import { Module } from "@nestjs/common";
import { GatewayModule } from "./backends/gateway.module";

/** @deprecated Use GatewayModule from ./backends/gateway.module */
@Module({ imports: [GatewayModule] })
export class AppModule {}
