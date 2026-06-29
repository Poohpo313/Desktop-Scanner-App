import {
  Body,
  Controller,
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
import { AssignKeyDto, BulkGenerateDto } from "./dto/key.dto";
import { KeysService } from "./keys.service";

@ApiTags("keys")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "superadmin")
@Controller("keys")
export class KeysController {
  constructor(private readonly keys: KeysService) {}

  @Get()
  list() {
    return this.keys.findAll();
  }

  @Post("generate")
  generate() {
    return this.keys.generate();
  }

  @Post("generate-bulk")
  @Roles("superadmin")
  generateBulk(@Body() dto: BulkGenerateDto) {
    return this.keys.generateBulk(dto.count);
  }

  @Post("assign")
  assign(@Body() dto: AssignKeyDto) {
    return this.keys.assign(dto.serialId, dto.userId);
  }

  @Patch(":id/revoke")
  revoke(@Param("id") id: string) {
    return this.keys.revoke(Number(id));
  }

  @Patch(":id/deactivate")
  deactivate(@Param("id") id: string) {
    return this.keys.deactivate(Number(id));
  }
}
