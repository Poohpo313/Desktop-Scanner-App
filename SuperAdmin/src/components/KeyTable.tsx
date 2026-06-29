import type { AdminUser, SerialKey } from "../types";

type Props = {
  keys: SerialKey[];
  users: AdminUser[];
  onRevoke: (key: SerialKey) => void;
  onDeactivate: (key: SerialKey) => void;
};

function badge(status: string) {
  const map: Record<string, string> = {
    unused: "bg-blue-100 text-blue-700",
    used: "bg-emerald-100 text-emerald-700",
    assigned: "bg-violet-100 text-violet-700",
    revoked: "bg-red-100 text-red-700",
    deactivated: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${map[status] ?? ""}`}>{status}</span>
  );
}

export default function KeyTable({ keys, users, onRevoke, onDeactivate }: Props) {
  const label = (id?: number | null) => {
    if (!id) return "—";
    const u = users.find((x) => x.userId === id);
    return u ? u.username : `#${id}`;
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3">Key</th>
            <th className="px-4 py-3">Assigned To</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Generated</th>
            <th className="px-4 py-3">Used</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key.serialId} className="border-t">
              <td className="px-4 py-3 font-mono">{key.serialKey}</td>
              <td className="px-4 py-3">{label(key.assignedTo)}</td>
              <td className="px-4 py-3">{badge(key.status)}</td>
              <td className="px-4 py-3 text-slate-500">
                {key.generatedAt ? new Date(key.generatedAt).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {key.usedAt ? new Date(key.usedAt).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3">
                {key.status !== "used" && key.status !== "revoked" && (
                  <div className="flex gap-2">
                    <button type="button" className="text-amber-600 hover:underline" onClick={() => onDeactivate(key)}>
                      Deactivate
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => onRevoke(key)}>
                      Revoke
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
