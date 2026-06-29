import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { BackupService } from "./backup.service";

@ApiTags("backup")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin")
@Controller("backup")
export class BackupController {
  constructor(private readonly backup: BackupService) {}

  @Get("history")
  history() {
    return this.backup.getHistory();
  }

  @Post("manual")
  manual() {
    return this.backup.manual();
  }

  @Post(":id/restore")
  restore(@Param("id") id: string) {
    return this.backup.restore(id);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.backup.delete(id);
  }
}
