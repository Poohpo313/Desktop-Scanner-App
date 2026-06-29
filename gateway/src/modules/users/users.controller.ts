import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { Roles } from "../../shared/decorators/roles.decorator";
import type { ScopedActor } from "../../shared/admin-scope";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RegisterUserDto, UpdateUserDto } from "./dto/user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "superadmin")
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(
    @CurrentUser() user: ScopedActor,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.users.findAllForActor(user, { page, limit });
  }

  @Get("recycle-bin")
  @Roles("superadmin")
  recycleBin() {
    return this.users.findDeleted();
  }

  @Get("lookups/departments")
  departments(@CurrentUser() user: ScopedActor) {
    return this.users.getDepartmentsForActor(user);
  }

  @Get("lookups/companies")
  companies(@CurrentUser() user: ScopedActor) {
    return this.users.getCompaniesForActor(user);
  }

  @Post("register")
  register(@CurrentUser() user: ScopedActor, @Body() dto: RegisterUserDto) {
    return this.users.registerForActor(user, dto);
  }

  @Patch(":id")
  update(@CurrentUser() user: ScopedActor, @Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.users.updateForActor(user, Number(id), dto);
  }

  @Patch(":id/restore")
  @Roles("superadmin")
  restore(@Param("id") id: string) {
    return this.users.restoreFromRecycle(Number(id));
  }

  @Delete(":id")
  remove(@CurrentUser() user: ScopedActor, @Param("id") id: string) {
    return this.users.softDeleteForActor(user, Number(id));
  }

  @Delete(":id/permanent")
  @Roles("superadmin")
  permanentRemove(@Param("id") id: string) {
    return this.users.remove(Number(id));
  }

  @Post(":id/verify-cloud")
  @Roles("superadmin")
  verifyCloud(@Param("id") id: string) {
    return {
      id,
      status: "not_configured",
      message: "Cloud verification is not available yet."
    };
  }

  @Post(":id/reject-cloud")
  @Roles("superadmin")
  rejectCloud(@Param("id") id: string) {
    return {
      id,
      status: "not_configured",
      message: "Cloud verification is not available yet."
    };
  }
}
