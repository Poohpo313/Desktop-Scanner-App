import { ForbiddenException, Injectable } from "@nestjs/common";
import { AdminsService } from "../../modules/admins/admins.service";
import {
  buildAdminScope,
  isSuperAdmin,
  matchesAdminScope,
  resolveActorId,
  type AdminScope,
  type ScopedActor,
} from "../admin-scope";

@Injectable()
export class AdminScopeService {
  constructor(private readonly admins: AdminsService) {}

  async resolveScope(actor: ScopedActor): Promise<AdminScope | null> {
    if (isSuperAdmin(actor.role)) return null;

    if (actor.company?.trim() && actor.department?.trim()) {
      return {
        company: actor.company.trim(),
        department: actor.department.trim(),
        departments: [actor.department.trim()],
      };
    }

    const admin = await this.admins.findById(resolveActorId(actor));
    return buildAdminScope(admin);
  }

  async assertRecordInScope(
    actor: ScopedActor,
    record: { company?: string | null; department?: string | null },
    message = "You do not have access to this record.",
  ): Promise<AdminScope | null> {
    if (isSuperAdmin(actor.role)) return null;

    const scope = await this.resolveScope(actor);
    if (!scope?.department || !matchesAdminScope(scope, record)) {
      throw new ForbiddenException(message);
    }

    return scope;
  }
}
