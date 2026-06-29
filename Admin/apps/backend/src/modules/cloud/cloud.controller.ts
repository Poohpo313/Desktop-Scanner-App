import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CloudService } from "./cloud.service";

@ApiTags("cloud")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin")
@Controller("cloud")
export class CloudController {
  constructor(private readonly cloud: CloudService) {}

  @Get("storage")
  storage() {
    return this.cloud.storage();
  }

  @Get("verification-list")
  verificationList() {
    return this.cloud.verificationList();
  }

  @Post("verify/:id")
  verify(@Param("id") id: string) {
    return this.cloud.verify(id);
  }

  @Post("reject/:id")
  reject(@Param("id") id: string) {
    return this.cloud.reject(id);
  }

  @Post("sync/:userId")
  syncUser(@Param("userId") userId: string) {
    return this.cloud.syncUser(Number(userId));
  }
}
