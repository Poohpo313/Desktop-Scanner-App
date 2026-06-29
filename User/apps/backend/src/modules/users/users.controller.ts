import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
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
  list() {
    return this.users.findAll();
  }

  @Post("register")
  register(@Body() dto: RegisterUserDto) {
    return this.users.register(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(Number(id), dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.users.softDelete(Number(id));
  }

  @Delete(":id/permanent")
  @Roles("superadmin")
  permanentRemove(@Param("id") id: string) {
    return this.users.remove(Number(id));
  }

  @Post(":id/verify-cloud")
  @Roles("superadmin")
  verifyCloud(@Param("id") id: string) {
    return this.users.update(Number(id), { accountStatus: "active" });
  }

  @Post(":id/reject-cloud")
  @Roles("superadmin")
  rejectCloud(@Param("id") id: string) {
    return this.users.update(Number(id), { accountStatus: "inactive" });
  }
}
