import { useEffect, useState } from "react";
import { useAppMode } from "../context/AppModeContext";

type SyncStatus = {
  pending: number;
  synced: number;
  failed: number;
  storageUsed: number;
};

const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024;

type Props = { compact?: boolean };

export function CloudSyncStatus({ compact = false }: Props) {
  const { isOnline } = useAppMode();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    const res = (await window.bukolabs?.sync.status()) as SyncStatus;
    setStatus(res);
  }

  async function syncAll() {
    setSyncing(true);
    try {
      await window.bukolabs?.sync.trigger();
      await load();
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (isOnline) load();
  }, [isOnline]);

  const used = status?.storageUsed ?? 0;
  const pct = Math.min(100, Math.round((used / STORAGE_LIMIT) * 100));
  const full = used >= STORAGE_LIMIT;

  if (!isOnline) {
    return (
      <div className={`card-surface ${compact ? "p-4" : "p-6"} text-center text-sm text-gray-500`}>
        <p className="text-3xl mb-2" aria-hidden="true">📶</p>
        <p className="font-medium text-gray-700">Cloud sync unavailable offline</p>
        <p className="text-xs mt-1">Go online to sync documents to the cloud.</p>
      </div>
    );
  }

  return (
    <div className={`card-surface space-y-4 ${compact ? "p-4" : "p-6"}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`font-semibold text-gray-900 ${compact ? "text-base" : "text-lg"}`}>
          Cloud Sync &amp; Privacy
        </h2>
        <button
          type="button"
          className="btn-primary text-sm py-2 px-4"
          onClick={syncAll}
          disabled={syncing}
        >
          {syncing ? "Syncing…" : "Sync All"}
        </button>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-600">Storage used</span>
          <span className="font-medium text-brand-emerald">{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-brand-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${full ? "bg-status-error" : "bg-brand-emerald"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {full && (
          <p className="text-sm text-status-error mt-2">
            Storage full — contact your administrator for more storage.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
          <div className="text-xl font-bold text-status-warning">{status?.pending ?? 0}</div>
          <div className="text-xs text-gray-500 mt-0.5">Pending</div>
        </div>
        <div className="rounded-lg bg-brand-mint/50 border border-brand-border p-3">
          <div className="text-xl font-bold text-brand-emerald">{status?.synced ?? 0}</div>
          <div className="text-xs text-gray-500 mt-0.5">Synced</div>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <div className="text-xl font-bold text-status-error">{status?.failed ?? 0}</div>
          <div className="text-xs text-gray-500 mt-0.5">Failed</div>
        </div>
      </div>
    </div>
  );
}
