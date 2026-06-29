import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { Roles } from "../../shared/decorators/roles.decorator";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import type { ScopedActor } from "../../shared/admin-scope";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { DevicesService } from "./devices.service";

@ApiTags("devices")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("devices")
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Roles("user")
  @Post("register")
  register(
    @CurrentUser() user: { userId: number; username: string },
    @Body()
    body: {
      deviceName?: string;
      deviceType?: string;
      serialNumber: string;
      assignedUser?: number;
      username?: string;
    },
  ) {
    return this.devices.register(body, user.userId);
  }

  @SkipThrottle()
  @Roles("user")
  @Post("heartbeat")
  heartbeat(
    @CurrentUser() user: { userId: number },
    @Body() body: { serialNumber: string; userId?: number },
  ) {
    return this.devices.heartbeat(body.serialNumber, user.userId);
  }

  @SkipThrottle()
  @Roles("user")
  @Post("disconnect")
  disconnect(
    @CurrentUser() user: { userId: number },
    @Body() body: { serialNumber: string },
  ) {
    return this.devices.disconnect(body.serialNumber, user.userId);
  }

  @Get()
  @Roles("admin", "superadmin")
  list(
    @CurrentUser() user: ScopedActor,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.devices.findAllForActor(user, { page, limit });
  }

  @Get("recycle-bin")
  @Roles("superadmin")
  recycleBin() {
    return this.devices.findRecycleBin();
  }

  @Patch(":id/restore")
  @Roles("superadmin")
  restore(@Param("id") id: string) {
    return this.devices.restoreFromRecycle(Number(id));
  }

  @Post(":id/flag-inactive")
  @Roles("admin", "superadmin")
  flagInactive(@Param("id") id: string, @CurrentUser() user: ScopedActor) {
    return this.devices.flagInactiveForActor(user, Number(id));
  }

  @Delete(":id/revoke")
  @Roles("superadmin")
  revoke(@Param("id") id: string, @CurrentUser() user: { userId: number }) {
    return this.devices.revoke(Number(id), user.userId);
  }

  @Delete(":id/permanent")
  @Roles("superadmin")
  permanentDelete(@Param("id") id: string, @CurrentUser() user: { userId: number }) {
    return this.devices.permanentDelete(Number(id), user.userId);
  }

  @Get("export")
  @Roles("admin", "superadmin")
  exportCsv(@CurrentUser() user: ScopedActor) {
    return this.devices.exportCsvForActor(user);
  }
}
