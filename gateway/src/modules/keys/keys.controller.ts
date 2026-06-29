import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AssignKeyDto, BulkGenerateDto, CreateRevocationRequestDto } from "./dto/key.dto";
import {
  ApproveKeyRequestDto,
  ForwardKeyRequestDto,
  ModifyKeyExpiryDto,
  RejectKeyRequestDto,
} from "./dto/key-extension.dto";
import { KeysService } from "./keys.service";
import { KeyExtensionService } from "./key-extension.service";
import type { ScopedActor } from "../../shared/admin-scope";
import { resolveActorId } from "../../shared/admin-scope";

@ApiTags("keys")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "superadmin")
@Controller("keys")
export class KeysController {
  constructor(
    private readonly keys: KeysService,
    private readonly keyExtension: KeyExtensionService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: ScopedActor,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.keys.findAllForActor(user, { page, limit });
  }

  @Get("revocations")
  revocations() {
    return this.keys.findRevocations();
  }

  @Get("recycle-bin")
  @Roles("superadmin")
  recycleBin() {
    return this.keys.findRecycleBin();
  }

  @Post("revocation-requests")
  @Roles("admin")
  createRevocationRequest(
    @Body() dto: CreateRevocationRequestDto,
    @CurrentUser() user: { userId: number }
  ) {
    return this.keys.createRevocationRequest(dto, user.userId);
  }

  @Get("revocation-requests")
  @Roles("admin")
  listRevocationRequests(@CurrentUser() user: { userId: number }) {
    return this.keys.findRevocationRequestsForAdmin(user.userId);
  }

  @Get("extension-requests/pending")
  @Roles("admin")
  listExtensionRequests(@CurrentUser() user: ScopedActor) {
    return this.keyExtension.listAdminRequests(user);
  }

  @Post("extension-requests/:id/forward")
  @Roles("admin")
  forwardExtensionRequest(
    @Param("id") id: string,
    @Body() dto: ForwardKeyRequestDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keyExtension.forwardRequest(user, Number(id), dto.adminNote);
  }

  @Post("extension-requests/:id/reject")
  @Roles("admin")
  rejectExtensionRequest(
    @Param("id") id: string,
    @Body() dto: RejectKeyRequestDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keyExtension.rejectRequest(user, Number(id), dto.note, "admin");
  }

  @Get("extension-requests/superadmin/pending")
  @Roles("superadmin")
  listSuperAdminExtensionRequests() {
    return this.keyExtension.listSuperAdminRequests();
  }

  @Post("extension-requests/:id/approve")
  @Roles("superadmin")
  approveExtensionRequest(
    @Param("id") id: string,
    @Body() dto: ApproveKeyRequestDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keyExtension.approveRequest(
      user,
      Number(id),
      dto.requestedDays,
      dto.superadminNote,
    );
  }

  @Post("extension-requests/:id/superadmin-reject")
  @Roles("superadmin")
  rejectSuperAdminExtensionRequest(
    @Param("id") id: string,
    @Body() dto: RejectKeyRequestDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keyExtension.rejectRequest(user, Number(id), dto.note, "superadmin");
  }

  @Patch("revocation-requests/:id/approve")
  @Roles("superadmin")
  approveRevocationRequest(
    @Param("id") id: string,
    @CurrentUser() user: { userId: number }
  ) {
    return this.keys.approveRevocationRequest(Number(id), user.userId);
  }

  @Patch("revocation-requests/:id/cancel")
  @Roles("admin")
  cancelRevocationRequest(
    @Param("id") id: string,
    @CurrentUser() user: { userId: number }
  ) {
    return this.keys.cancelRevocationRequest(Number(id), user.userId);
  }

  @Patch("revocation-requests/:id/deny")
  @Roles("superadmin")
  denyRevocationRequest(
    @Param("id") id: string,
    @CurrentUser() user: { userId: number }
  ) {
    return this.keys.denyRevocationRequest(Number(id), user.userId);
  }

  @Post("generate")
  generate(@CurrentUser() user: ScopedActor) {
    return this.keys.generateForActor(user);
  }

  @Post("generate-bulk")
  @Roles("superadmin")
  generateBulk(@Body() dto: BulkGenerateDto) {
    return this.keys.generateBulk(dto.count, {
      company: dto.company,
      department: dto.department,
      expirationDays: dto.expirationDays
    });
  }

  @Delete("all")
  @Roles("superadmin")
  deleteAll() {
    return this.keys.deleteAll();
  }

  @Post("assign")
  assign(
    @Body() dto: AssignKeyDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keys.assignForActor(user, dto.serialId, dto.userId);
  }

  @Patch(":id/revoke")
  @Roles("superadmin")
  revoke(@Param("id") id: string, @CurrentUser() user: { userId: number }) {
    return this.keys.revoke(Number(id), user.userId);
  }

  @Patch(":id/restore")
  @Roles("superadmin")
  restore(@Param("id") id: string, @CurrentUser() user: { userId: number }) {
    return this.keys.restoreRevokedKey(Number(id), user.userId);
  }

  @Patch(":id/deactivate")
  deactivate(@Param("id") id: string, @CurrentUser() user: ScopedActor) {
    return this.keys.deactivateForActor(user, Number(id));
  }

  @Delete(":id/permanent")
  @Roles("superadmin")
  permanentDelete(@Param("id") id: string, @CurrentUser() user: { userId: number }) {
    return this.keys.permanentDelete(Number(id), user.userId);
  }

  @Patch(":id/modify-expiry")
  @Roles("superadmin")
  modifyExpiry(
    @Param("id") id: string,
    @Body() dto: ModifyKeyExpiryDto,
    @CurrentUser() user: ScopedActor,
  ) {
    return this.keyExtension.modifyExpiryDirect(
      Number(id),
      dto.durationDays,
      resolveActorId(user),
      dto.note,
    );
  }
}
