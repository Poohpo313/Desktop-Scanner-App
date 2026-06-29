import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { DevicesService } from "./devices.service";

@ApiTags("devices")
@Controller("devices")
export class DeviceRegistrationController {
  constructor(private readonly devices: DevicesService) {}

  @Post("register")
  register(
    @Body()
    body: {
      deviceName?: string;
      deviceType?: string;
      serialNumber: string;
      assignedUser: number;
    }
  ) {
    return this.devices.register(body);
  }

  @Post("heartbeat")
  heartbeat(@Body() body: { serialNumber: string; userId?: number }) {
    return this.devices.heartbeat(body.serialNumber, body.userId);
  }
}

@ApiTags("devices")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("devices")
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Get()
  @Roles("admin", "superadmin")
  list() {
    return this.devices.findAll();
  }

  @Post(":id/flag-inactive")
  @Roles("admin", "superadmin")
  flagInactive(@Param("id") id: string) {
    return this.devices.flagInactive(Number(id));
  }

  @Delete(":id/revoke")
  @Roles("superadmin")
  revoke(@Param("id") id: string) {
    return this.devices.revoke(Number(id));
  }

  @Get("export")
  @Roles("admin", "superadmin")
  exportCsv() {
    return this.devices.exportCsv();
  }
}
