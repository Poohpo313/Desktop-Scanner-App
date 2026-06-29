import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SyncService } from "./sync.service";

@ApiTags("sync")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("sync")
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post("documents")
  upload(
    @CurrentUser() user: { userId: number },
    @Body() body: unknown
  ) {
    return this.sync.uploadDocuments(user.userId, body as never);
  }
}
