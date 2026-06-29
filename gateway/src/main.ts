import { mkdirSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { AdminBackendModule } from "./backends/admin-backend.module";
import { GatewayModule } from "./backends/gateway.module";
import { SuperAdminBackendModule } from "./backends/superadmin-backend.module";
import { UserBackendModule } from "./backends/user-backend.module";

type BackendRole = "gateway" | "admin" | "superadmin" | "user";

function resolveModule(role: BackendRole) {
  switch (role) {
    case "admin":
      return AdminBackendModule;
    case "superadmin":
      return SuperAdminBackendModule;
    case "user":
      return UserBackendModule;
    default:
      return GatewayModule;
  }
}

function defaultPort(role: BackendRole): number {
  switch (role) {
    case "admin":
      return 3001;
    case "superadmin":
      return 3002;
    case "user":
      return 3003;
    default:
      return 3000;
  }
}

async function bootstrap() {
  const role = (process.env.BACKEND_ROLE ?? "gateway") as BackendRole;
  const appModule = resolveModule(role);
  const app = await NestFactory.create(appModule);

  app.setGlobalPrefix("api/v1");
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.enableCors({
    origin: [
      process.env.FRONTEND_ADMIN_URL ?? "http://localhost:5174",
      process.env.FRONTEND_SUPERADMIN_URL ?? "http://localhost:5175",
      "http://localhost:5173"
    ],
    credentials: true
  });

  const swagger = new DocumentBuilder()
    .setTitle(`Bukolabs.io Scanner API (${role})`)
    .setDescription(
      "Online PostgreSQL API for Admin, Super Admin, and User sync. Cloud storage (e.g. GCS) is a separate planned extension."
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, swagger));

  const http = app.getHttpAdapter().getInstance();
  http.get("/", (_req: unknown, res: { redirect: (url: string) => void }) => {
    res.redirect("/api/docs");
  });

  const port = Number(process.env.PORT ?? defaultPort(role));
  const host = process.env.HOST ?? "0.0.0.0";
  await app.listen(port, host);

  publishGatewayEndpoints(port);

  console.log(
    `Bukolabs ${role} backend listening on http://${host === "0.0.0.0" ? "localhost" : host}:${port}/api/v1`,
  );
  if (host === "0.0.0.0") {
    console.log(`Health check: http://<this-pc-ip>:${port}/api/v1/health`);
    console.log(`LAN clients can use http://<this-pc-ip>:${port}/api/v1`);
  }
}

function publishGatewayEndpoints(port: number) {
  try {
    const urls = new Set<string>([
      `http://localhost:${port}/api/v1`,
      `http://127.0.0.1:${port}/api/v1`,
    ]);

    const interfaces = networkInterfaces();
    if (interfaces) {
      for (const entries of Object.values(interfaces)) {
        for (const entry of entries ?? []) {
          if (entry.family === "IPv4" && !entry.internal) {
            urls.add(`http://${entry.address}:${port}/api/v1`);
          }
        }
      }
    }

    const directory = join(process.env.ProgramData ?? "C:\\ProgramData", "Bukolabs", "gateway");
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, "endpoint.json"),
      JSON.stringify({ urls: Array.from(urls), updatedAt: Date.now() }, null, 2),
      "utf8",
    );
  } catch (error) {
    console.warn("Could not publish gateway endpoint file:", error);
  }
}

bootstrap();
