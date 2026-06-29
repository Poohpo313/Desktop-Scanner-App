import type { AdminUser } from "../types";

type SortKey = "name" | "username" | "createdAt" | "status";

type Props = {
  users: AdminUser[];
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
};

function fullName(user: AdminUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || "—";
}

function SortHeader({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="font-medium hover:text-brand-mid">
      {label} {active ? (asc ? "↑" : "↓") : ""}
    </button>
  );
}

export default function UserTable({ users, sortKey, sortAsc, onSort, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3">
              <SortHeader
                label="Name"
                active={sortKey === "name"}
                asc={sortAsc}
                onClick={() => onSort("name")}
              />
            </th>
            <th className="px-4 py-3">
              <SortHeader
                label="Username"
                active={sortKey === "username"}
                asc={sortAsc}
                onClick={() => onSort("username")}
              />
            </th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">
              <SortHeader
                label="Status"
                active={sortKey === "status"}
                asc={sortAsc}
                onClick={() => onSort("status")}
              />
            </th>
            <th className="px-4 py-3">Serial Key</th>
            <th className="px-4 py-3">
              <SortHeader
                label="Created"
                active={sortKey === "createdAt"}
                asc={sortAsc}
                onClick={() => onSort("createdAt")}
              />
            </th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                No users found
              </td>
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-mid hover:underline"
                      onClick={() => onEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => onDelete(user)}
                    >
                      Delete
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
