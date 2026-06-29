import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  ChangePasswordDto,
  ChangePinDto
} from "./dto/change-credentials.dto";
import {
  AdminLoginDto,
  SuperAdminLoginDto,
  UserLoginDto
} from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("superadmin/login")
  superAdminLogin(@Body() dto: SuperAdminLoginDto) {
    return this.auth.loginWithPin(dto.pin);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("admin/login")
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.auth.loginWithPassword(dto.username, dto.password, "admin");
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("user/login")
  userLogin(@Body() dto: UserLoginDto) {
    return this.auth.loginWithPassword(dto.username, dto.password, "user");
  }

  @Post("logout")
  logout() {
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("change-pin")
  changePin(@Body() dto: ChangePinDto) {
    return this.auth.changePin(dto);
  }
}
