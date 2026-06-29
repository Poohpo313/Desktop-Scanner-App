import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RoleEntity } from "./entities/role.entity";

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  user: ["scan", "files", "search"],
  admin: ["users", "keys", "devices", "reports"],
  superadmin: ["*"]
};

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity, "online")
    private readonly roles: Repository<RoleEntity>
  ) {}

  async list() {
    const rows = await this.roles.find({ order: { roleId: "ASC" } });
    return rows.map((role) => ({
      roleId: role.roleId,
      roleName: role.roleName,
      permissions: DEFAULT_PERMISSIONS[role.roleName] ?? []
    }));
  }

  async update(roleId: number, permissions: string[]) {
    const role = await this.roles.findOne({ where: { roleId } });
    if (!role) throw new NotFoundException("Role not found");
    return {
      roleId: role.roleId,
      roleName: role.roleName,
      permissions
    };
  }
}
