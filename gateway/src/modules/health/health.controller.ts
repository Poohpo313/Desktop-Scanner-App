import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller()
export class HealthController {
  @Get()
  root() {
    const role = process.env.BACKEND_ROLE ?? "gateway";
    return {
      status: "ok",
      service: "bukolabs-api",
      role,
      health: "/api/v1/health",
      docs: "/api/docs",
    };
  }

  @Get("health")
  check() {
    const role = process.env.BACKEND_ROLE ?? "gateway";
    return {
      status: "ok",
      service: "bukolabs-api",
      role,
      version: "1.0.0",
    };
  }
}
