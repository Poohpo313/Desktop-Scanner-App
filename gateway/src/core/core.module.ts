import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { buildOnlineDatabaseConfig } from "../database/database.config";

const repoRoot = join(__dirname, "..", "..", "..");
const sharedOnlineEnv = join(repoRoot, "backend-modules", "shared", ".env.online");

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        sharedOnlineEnv,
        join(__dirname, "..", "..", ".env"),
        join(process.cwd(), ".env")
      ]
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      name: "online",
      inject: [ConfigService],
      useFactory: (config: ConfigService) => buildOnlineDatabaseConfig(config)
    })
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
  exports: [ConfigModule, TypeOrmModule, ScheduleModule, ThrottlerModule]
})
export class CoreModule {}
