import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { ScopedActor } from "../../shared/admin-scope";
import { ApproveKeyRequestDto, RejectKeyRequestDto } from "./dto/key-extension.dto";
import { KeyExtensionService } from "./key-extension.service";

@ApiTags("superadmin-key-requests")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin")
@Controller("superadmin/key-requests")
export class SuperAdminKeyRequestsController {
  constructor(private readonly keyExtension: KeyExtensionService) {}

  @Get()
  list() {
    return this.keyExtension.listSuperAdminRequests();
  }

  @Post(":id/approve")
  approve(
    @Param("id") id: string,
    @Body() dto: ApproveKeyRequestDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keyExtension.approveRequest(
      user,
      Number(id),
      dto.requestedDays,
      dto.superadminNote,
    );
  }

  @Post(":id/reject")
  reject(@Param("id") id: string, @Body() dto: RejectKeyRequestDto, @CurrentUser() user: ScopedActor) {
    return this.keyExtension.rejectRequest(user, Number(id), dto.note, "superadmin");
  }
}
