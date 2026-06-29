import type { AdminUser, SerialKey } from "../types";

type Props = {
  keys: SerialKey[];
  users: AdminUser[];
  onAssign: (key: SerialKey) => void;
  onRevoke: (key: SerialKey) => void;
  onDeactivate: (key: SerialKey) => void;
};

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    unused: "bg-blue-100 text-blue-700",
    used: "bg-emerald-100 text-emerald-700",
    assigned: "bg-violet-100 text-violet-700",
    revoked: "bg-red-100 text-red-700",
    deactivated: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status] ?? "bg-slate-100"}`}>
      {status}
    </span>
  );
}

function userLabel(userId: number | null | undefined, users: AdminUser[]) {
  if (!userId) return "—";
  const user = users.find((u) => u.userId === userId);
  return user ? `${user.username} (#${userId})` : `#${userId}`;
}

export default function KeyTable({ keys, users, onAssign, onRevoke, onDeactivate }: Props) {
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
          {keys.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                No keys yet
              </td>
            </tr>
          ) : (
            keys.map((key) => (
              <tr key={key.serialId} className="border-t">
                <td className="px-4 py-3 font-mono">{key.serialKey}</td>
                <td className="px-4 py-3">{userLabel(key.assignedTo, users)}</td>
                <td className="px-4 py-3">{statusBadge(key.status)}</td>
                <td className="px-4 py-3 text-slate-500">
                  {key.generatedAt ? new Date(key.generatedAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {key.usedAt ? new Date(key.usedAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {key.status === "unused" && (
                      <button
                        type="button"
                        className="text-brand-mid hover:underline"
                        onClick={() => onAssign(key)}
                      >
                        Assign
                      </button>
                    )}
                    {key.status !== "revoked" && key.status !== "used" && (
                      <>
                        <button
                          type="button"
                          className="text-amber-600 hover:underline"
                          onClick={() => onDeactivate(key)}
                        >
                          Deactivate
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={() => onRevoke(key)}
                        >
                          Revoke
                        </button>
                      </>
                    )}
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
