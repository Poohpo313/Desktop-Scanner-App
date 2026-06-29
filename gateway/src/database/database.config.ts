import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

function requireDatabaseConfig(config: ConfigService) {
  const url = config.get<string>("ONLINE_DATABASE_URL");

  if (url?.trim()) {
    return { url: url.trim() } as const;
  }

  const host = config.get<string>("DB_HOST", "localhost");
  const port = Number(config.get<string>("DB_PORT", "5432"));
  const username = config.get<string>("DB_USER", "postgres");
  const database = config.get<string>("DB_NAME", "bukolabs_scanner");

  const passwordRaw = config.get<string>("DB_PASSWORD");
  if (passwordRaw === undefined || passwordRaw === null) {
    throw new Error(
      [
        "PostgreSQL is not configured.",
        "Create apps/backend/.env (copy from .env.example) and set either:",
        "  ONLINE_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/bukolabs_scanner",
        "  or DB_USER, DB_PASSWORD, DB_NAME (and optionally DB_HOST, DB_PORT)."
      ].join("\n")
    );
  }

  const password = String(passwordRaw);
  if (!password) {
    throw new Error(
      [
        "DB_PASSWORD is empty in apps/backend/.env.",
        "PostgreSQL SCRAM auth requires a non-empty password.",
        "Set DB_PASSWORD to the password you chose when installing PostgreSQL",
        "(often the password for the postgres user)."
      ].join("\n")
    );
  }

  return {
    host,
    port,
    username,
    password,
    database
  } as const;
}

export function buildOnlineDatabaseConfig(
  config: ConfigService
): TypeOrmModuleOptions {
  const connection = requireDatabaseConfig(config);

  return {
    name: "online",
    type: "postgres",
    ...connection,
    autoLoadEntities: true,
    synchronize: false
  };
}
