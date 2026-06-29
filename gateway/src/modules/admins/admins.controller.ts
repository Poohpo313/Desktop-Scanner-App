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
import { AdminsService } from "./admins.service";
import { CreateAdminDto, UpdateAdminDto } from "./dto/admin.dto";

@ApiTags("admins")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin")
@Controller("admins")
export class AdminsController {
  constructor(private readonly admins: AdminsService) {}

  @Get()
  list() {
    return this.admins.findAll();
  }

  @Get("recycle-bin")
  recycleBin() {
    return this.admins.findDeleted();
  }

  @Post()
  create(@Body() dto: CreateAdminDto) {
    return this.admins.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateAdminDto) {
    return this.admins.update(Number(id), dto);
  }

  @Post(":id/restore")
  restore(@Param("id") id: string) {
    return this.admins.restore(Number(id));
  }

  @Delete(":id")
  softDelete(@Param("id") id: string) {
    return this.admins.softDelete(Number(id));
  }

  @Delete(":id/permanent")
  permanentDelete(@Param("id") id: string) {
    return this.admins.permanentDelete(Number(id));
  }
}
