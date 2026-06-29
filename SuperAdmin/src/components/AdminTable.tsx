import type { AdminAccount } from "../types";

type SortKey = "name" | "username" | "createdAt" | "role";

type Props = {
  admins: AdminAccount[];
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
  onEdit: (admin: AdminAccount) => void;
  onDelete: (admin: AdminAccount) => void;
};

function name(a: AdminAccount) {
  return [a.firstName, a.lastName].filter(Boolean).join(" ") || "—";
}

export default function AdminTable({ admins, sortKey, sortAsc, onSort, onEdit, onDelete }: Props) {
  const header = (label: string, key: SortKey) => (
    <button type="button" onClick={() => onSort(key)} className="hover:text-brand-mid">
      {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3">{header("Name", "name")}</th>
            <th className="px-4 py-3">{header("Username", "username")}</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">{header("Role", "role")}</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">{header("Created", "createdAt")}</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No admins</td>
            </tr>
          ) : (
            admins.map((admin) => (
              <tr key={admin.adminId} className="border-t">
                <td className="px-4 py-3">{name(admin)}</td>
                <td className="px-4 py-3">{admin.username}</td>
                <td className="px-4 py-3">{admin.email ?? "—"}</td>
                <td className="px-4 py-3">#{admin.roleId ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                    {admin.accountStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" className="text-brand-mid hover:underline" onClick={() => onEdit(admin)}>
                      Edit
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(admin)}>
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
