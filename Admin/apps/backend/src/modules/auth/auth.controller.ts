import {
  Body,
  Controller,
  Post,
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
import {
  AdminLoginDto,
  SuperAdminLoginDto,
  UserLoginDto
} from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";

const REFRESH_COOKIE = "refresh_token";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? 7) * 24 * 60 * 60 * 1000
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

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.revokeRefreshToken(raw ?? "");
    clearRefreshCookie(res);
    return { success: true };
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
