import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { ScopedActor } from "../../shared/admin-scope";
import { CreateUserConcernDto, UpdateUserConcernStatusDto } from "./dto/user-concern.dto";
import { UserConcernsService } from "./user-concerns.service";

@ApiTags("user-concerns")
@Controller("user-concerns")
export class UserConcernsController {
  constructor(private readonly concerns: UserConcernsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user")
  @Post()
  create(
    @CurrentUser() user: { userId: number },
    @Body() dto: CreateUserConcernDto
  ) {
    return this.concerns.create(user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user")
  @Get("mine")
  listMine(@CurrentUser() user: { userId: number }) {
    return this.concerns.listForUser(user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @Get()
  list(
    @CurrentUser() user: ScopedActor,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.concerns.listForActor(user, { page, limit });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @Patch(":id/status")
  updateStatus(
    @CurrentUser() user: ScopedActor,
    @Param("id") id: string,
    @Body() dto: UpdateUserConcernStatusDto,
  ) {
    return this.concerns.updateStatusForActor(user, Number(id), dto.status, dto.adminReply);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user")
  @Patch(":id/read-reply")
  markReplyRead(@Param("id") id: string, @CurrentUser() user: { userId: number }) {
    return this.concerns.markReplyRead(Number(id), user.userId);
  }
}
