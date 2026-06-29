import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { SystemConfigService } from "./config.service";

@ApiTags("config")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin")
@Controller("config")
export class ConfigController {
  constructor(private readonly config: SystemConfigService) {}

  @Get()
  get() {
    return this.config.get();
  }

  @Patch()
  patch(@Body() body: Record<string, unknown>) {
    return this.config.patch(body as never);
  }
}
