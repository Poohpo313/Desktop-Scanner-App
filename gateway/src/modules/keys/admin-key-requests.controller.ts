import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { ScopedActor } from "../../shared/admin-scope";
import { ForwardKeyRequestDto, RejectKeyRequestDto } from "./dto/key-extension.dto";
import { KeyExtensionService } from "./key-extension.service";

@ApiTags("admin-key-requests")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Controller("admin/key-requests")
export class AdminKeyRequestsController {
  constructor(private readonly keyExtension: KeyExtensionService) {}

  @Get()
  list(@CurrentUser() user: ScopedActor) {
    return this.keyExtension.listAdminRequests(user);
  }

  @Post(":id/forward")
  forward(
    @Param("id") id: string,
    @Body() dto: ForwardKeyRequestDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keyExtension.forwardRequest(user, Number(id), dto.adminNote);
  }

  @Post(":id/reject")
  reject(
    @Param("id") id: string,
    @Body() dto: RejectKeyRequestDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keyExtension.rejectRequest(user, Number(id), dto.note, "admin");
  }
}
