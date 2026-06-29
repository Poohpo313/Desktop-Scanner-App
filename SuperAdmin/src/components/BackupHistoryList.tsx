import type { BackupRecord } from "../types";

type Props = {
  items: BackupRecord[];
  onRestore: (item: BackupRecord) => void;
  onDelete: (item: BackupRecord) => void;
};

export default function BackupHistoryList({ items, onRestore, onDelete }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No backups yet. Run a manual backup to get started.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Version</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Encrypted</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3 font-mono">{item.version}</td>
              <td className="px-4 py-3">{item.sizeMb} MB</td>
              <td className="px-4 py-3">{item.encrypted ? "AES-256" : "—"}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button type="button" className="text-brand-mid hover:underline" onClick={() => onRestore(item)}>
                    Restore
                  </button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(item)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
