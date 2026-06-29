import type { AdminUser } from "../types";

type Props = {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onSoftDelete: (user: AdminUser) => void;
  onPermanentDelete: (user: AdminUser) => void;
};

function fullName(u: AdminUser) {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
}

export default function UserTable({ users, onEdit, onSoftDelete, onPermanentDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Serial Key</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No users</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.userId} className="border-t">
                <td className="px-4 py-3">{fullName(user)}</td>
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{user.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      user.accountStatus === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.accountStatus}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{user.serialKey ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="text-brand-mid hover:underline" onClick={() => onEdit(user)}>
                      Edit
                    </button>
                    <button type="button" className="text-amber-600 hover:underline" onClick={() => onSoftDelete(user)}>
                      Recycle
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => onPermanentDelete(user)}
                    >
                      Delete forever
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
