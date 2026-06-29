import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TopBar from "../components/TopBar";
import UserTable from "../components/UserTable";
import Modal from "../components/Modal";
import { usersApi } from "../api/users.api";
import { extractApiError } from "../lib/extractApiError";
import { useNotificationStore } from "../store/notificationStore";
import type { AdminUser } from "../types";

const editSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  accountStatus: z.enum(["active", "inactive", "deleted"]),
});

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [confirm, setConfirm] = useState<{ user: AdminUser; type: "soft" | "permanent" } | null>(null);
  const push = useNotificationStore((s) => s.push);
  const editForm = useForm({ resolver: zodResolver(editSchema) });

  const load = useCallback(() => {
    usersApi.list().then(setUsers).catch(() => push("Failed to load users", "error"));
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!editUser) return;
    editForm.reset({
      firstName: editUser.firstName ?? "",
      lastName: editUser.lastName ?? "",
      email: editUser.email ?? "",
      phoneNumber: editUser.phoneNumber ?? "",
      accountStatus: (editUser.accountStatus as "active" | "inactive" | "deleted") ?? "inactive",
    });
  }, [editUser, editForm]);

  const activeUsers = users.filter((u) => u.accountStatus !== "deleted");

  return (
    <>
      <TopBar title="User Management" showLogout={false} />
      <main className="flex-1 space-y-4 p-6">
        <UserTable
          users={activeUsers}
          onEdit={setEditUser}
          onSoftDelete={(u) => setConfirm({ user: u, type: "soft" })}
          onPermanentDelete={(u) => setConfirm({ user: u, type: "permanent" })}
        />
      </main>

      <Modal open={!!editUser} title="Edit user" onClose={() => setEditUser(null)}>
        <form
          onSubmit={editForm.handleSubmit(async (data) => {
            if (!editUser) return;
            await usersApi.update(editUser.userId, data);
            push("User updated", "success");
            setEditUser(null);
            load();
          })}
          className="space-y-3"
        >
          <input {...editForm.register("firstName")} className="w-full rounded-lg border px-3 py-2" placeholder="First name" />
          <input {...editForm.register("lastName")} className="w-full rounded-lg border px-3 py-2" placeholder="Last name" />
          <input {...editForm.register("email")} className="w-full rounded-lg border px-3 py-2" placeholder="Email" />
          <input {...editForm.register("phoneNumber")} className="w-full rounded-lg border px-3 py-2" placeholder="Phone" />
          <select {...editForm.register("accountStatus")} className="w-full rounded-lg border px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deleted">Deleted</option>
          </select>
          <button type="submit" className="w-full rounded-lg bg-brand-mid py-2 text-white text-sm">Save</button>
        </form>
      </Modal>

      <Modal open={!!confirm} title="Confirm action" onClose={() => setConfirm(null)}>
        <p className="text-sm">
          {confirm?.type === "permanent"
            ? `Permanently delete ${confirm.user.username}? This cannot be undone.`
            : `Move ${confirm?.user.username} to recycle bin?`}
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-red-600 py-2 text-white text-sm"
          onClick={async () => {
            if (!confirm) return;
            try {
              if (confirm.type === "permanent") await usersApi.permanentDelete(confirm.user.userId);
              else await usersApi.softDelete(confirm.user.userId);
              push(confirm.type === "permanent" ? "User permanently deleted" : "User moved to recycle bin", "success");
              setConfirm(null);
              load();
            } catch (error) {
              push(extractApiError(error, "Failed to delete user"), "error");
            }
          }}
        >
          Confirm
        </button>
      </Modal>
    </>
  );
}
