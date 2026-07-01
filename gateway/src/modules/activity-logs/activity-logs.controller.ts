import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import type { ScopedActor } from "../../shared/admin-scope";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ActivityLogArchiveService } from "./activity-log-archive.service";
import { ActivityLogsService } from "./activity-logs.service";

@ApiTags("activity-logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "superadmin")
@Controller("activity-logs")
export class ActivityLogsController {
  constructor(
    private readonly activityLogs: ActivityLogsService,
    private readonly archive: ActivityLogArchiveService
  ) {}

  @Get()
  list(@CurrentUser() user: ScopedActor) {
    return this.activityLogs.listForActor(user);
  }

  @Get("status")
  @Roles("superadmin")
  status() {
    return this.archive.status();
  }

  @Post("archive")
  @Roles("superadmin")
  archiveNow() {
    return this.archive.archiveAndReset();
  }
}

// SuperAdmin UI calls GET /logs
@ApiTags("logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin")
@Controller("logs")
export class LogsAliasController {
  constructor(
    private readonly activityLogs: ActivityLogsService,
    private readonly archive: ActivityLogArchiveService
  ) {}

  @Get()
  list() {
    return this.activityLogs.list();
  }

  @Get("status")
  status() {
    return this.archive.status();
  }

  @Post("archive")
  archiveNow() {
    return this.archive.archiveAndReset();
  }
}
