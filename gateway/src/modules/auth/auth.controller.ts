import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Response, Request } from "express";
import {
  ChangePasswordDto,
  ChangePinDto
} from "./dto/change-credentials.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ActivateUserAccountDto, SyncUserAccountDto } from "./dto/user-account.dto";
import {
  AdminLoginDto,
  SuperAdminLoginDto,
  UserLoginDto
} from "./dto/login.dto";
import {
  AdminRecoveryDto,
  SuperAdminRecoveryDto,
  UserRecoveryDto
} from "./dto/recovery.dto";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "../../shared/decorators/roles.decorator";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import type { JwtPayload } from "../../shared/types";

const REFRESH_COOKIE = "refresh_token";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? 30) * 24 * 60 * 60 * 1000
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("superadmin/login")
  async superAdminLogin(
    @Body() dto: SuperAdminLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.auth.loginWithPin(dto.pin);
    setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _ignored, ...body } = result;
    return body;
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("admin/login")
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.auth.loginWithPassword(
      dto.username,
      dto.password,
      "admin"
    );
    setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _ignored, ...body } = result;
    return body;
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("user/login")
  async userLogin(
    @Body() dto: UserLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.auth.loginWithPassword(
      dto.username,
      dto.password,
      "user"
    );
    setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _ignored, ...body } = result;
    return body;
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("user/activate")
  activateUserAccount(@Body() dto: ActivateUserAccountDto) {
    return this.auth.activateUserAccount(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("user/sync-account")
  syncUserAccount(@Body() dto: SyncUserAccountDto) {
    return this.auth.syncUserAccountForOffline(dto);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get("user/public-support-contact")
  getPublicSupportContact(
    @Query("username") username?: string,
    @Query("serialKey") serialKey?: string
  ) {
    return this.auth.getPublicSupportContact({ username, serialKey });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user")
  @Get("user/support-contact")
  getUserSupportContact(@CurrentUser() user: { userId: number }) {
    return this.auth.getUserSupportContact(user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user")
  @Patch("user/profile")
  updateUserProfile(
    @CurrentUser() user: { userId: number },
    @Body() dto: UpdateProfileDto
  ) {
    return this.auth.updateUserProfile(user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user")
  @Post("user/change-password")
  changeUserPassword(
    @CurrentUser() user: { userId: number },
    @Body() dto: ChangePasswordDto
  ) {
    return this.auth.changeUserPassword(user.userId, dto);
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await this.auth.refreshSession(raw ?? "");
    setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _ignored, ...body } = result;
    return body;
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("admin/forgot-credentials")
  adminForgotCredentials(@Body() dto: AdminRecoveryDto) {
    return this.auth.submitAdminRecovery(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("superadmin/forgot-access")
  superAdminForgotAccess(@Body() dto: SuperAdminRecoveryDto) {
    return this.auth.submitSuperAdminRecovery(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("user/forgot-credentials")
  userForgotCredentials(@Body() dto: UserRecoveryDto) {
    return this.auth.submitUserRecovery(dto);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Get("recovery/:requestId/status")
  recoveryStatus(@Param("requestId") requestId: string) {
    return this.auth.getRecoveryRequestStatus(requestId);
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.revokeRefreshToken(raw ?? "");
    clearRefreshCookie(res);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: JwtPayload & { userId: number }) {
    return this.auth.getProfile(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  updateProfile(
    @CurrentUser() user: JwtPayload & { userId: number },
    @Body() dto: UpdateProfileDto
  ) {
    return this.auth.updateProfile(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  changePassword(
    @CurrentUser() user: { userId: number },
    @Body() dto: ChangePasswordDto
  ) {
    return this.auth.changePassword(user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("change-pin")
  changePin(
    @CurrentUser() user: { userId: number },
    @Body() dto: ChangePinDto
  ) {
    return this.auth.changePin(user.userId, dto);
  }
}
