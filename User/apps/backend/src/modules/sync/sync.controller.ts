import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SyncService } from "./sync.service";

@ApiTags("sync")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("sync")
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post("documents")
  upload(@Body() body: unknown) {
    return this.sync.uploadDocuments(body);
  }
}
