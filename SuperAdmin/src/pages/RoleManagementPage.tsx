import { useCallback, useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { rolesApi } from "../api/roles.api";
import { useNotificationStore } from "../store/notificationStore";
import type { RoleDef } from "../types";

const ALL_PERMISSIONS = ["scan", "files", "search", "users", "keys", "devices", "reports", "cloud", "backup", "config"];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(() => {
    rolesApi.list().then(setRoles).catch(() => push("Failed to load roles", "error"));
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (role: RoleDef, perm: string) => {
    const next = role.permissions.includes(perm)
      ? role.permissions.filter((p) => p !== perm)
      : [...role.permissions, perm];
    await rolesApi.update(role.roleId, next);
    push("Role permissions updated", "success");
    load();
  };

  return (
    <>
      <TopBar title="Role Management" />
      <main className="flex-1 space-y-6 p-6">
        {roles.map((role) => (
          <section key={role.roleId} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold capitalize">{role.roleName}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={role.permissions.includes(perm) || role.permissions.includes("*")}
                    disabled={role.permissions.includes("*")}
                    onChange={() => toggle(role, perm)}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
