import { Injectable } from "@nestjs/common";

type RoleDef = {
  roleId: number;
  roleName: string;
  permissions: string[];
};

const ROLES: RoleDef[] = [
  {
    roleId: 1,
    roleName: "user",
    permissions: ["scan", "files", "search"]
  },
  {
    roleId: 2,
    roleName: "admin",
    permissions: ["users", "keys", "devices", "reports"]
  },
  {
    roleId: 3,
    roleName: "superadmin",
    permissions: ["*"]
  }
];

@Injectable()
export class RolesService {
  list() {
    return ROLES;
  }

  update(roleId: number, permissions: string[]) {
    const role = ROLES.find((r) => r.roleId === roleId);
    if (!role) return null;
    role.permissions = permissions;
    return role;
  }
}
