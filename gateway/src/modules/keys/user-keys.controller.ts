import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { JwtPayload } from "../../shared/types";

type AuthUser = JwtPayload & { userId: number };
import { RequestKeyExtensionDto } from "./dto/key-extension.dto";
import { KeyExtensionService } from "./key-extension.service";

@ApiTags("keys")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
@Controller("keys/my-key")
export class UserKeysController {
  constructor(private readonly keyExtension: KeyExtensionService) {}

  @Get("status")
  status(@CurrentUser() user: AuthUser) {
    return this.keyExtension.getMyKeyStatus(user.userId);
  }

  @Post("request-extension")
  requestExtension(@CurrentUser() user: AuthUser, @Body() dto: RequestKeyExtensionDto) {
    return this.keyExtension.submitRequest(
      user.userId,
      "extension",
      dto.requestedDays,
      dto.userNote,
    );
  }

  @Post("request-renewal")
  requestRenewal(@CurrentUser() user: AuthUser, @Body() dto: RequestKeyExtensionDto) {
    return this.keyExtension.submitRequest(
      user.userId,
      "renewal",
      dto.requestedDays,
      dto.userNote,
    );
  }
}
