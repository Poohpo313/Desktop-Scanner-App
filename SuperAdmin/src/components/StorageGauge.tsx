import type { CloudStorage } from "../types";

type Props = { storage: CloudStorage | null };

export default function StorageGauge({ storage }: Props) {
  const percent = storage?.percent ?? 0;
  const used = storage?.usedGb ?? 0;
  const total = storage?.totalGb ?? 100;
  const full = percent >= 95;

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="font-semibold text-brand-dark">Cloud storage</h2>
      <p className="mt-1 text-sm text-slate-500">
        {used.toFixed(1)} GB of {total} GB used ({percent}%)
      </p>
      <div className="mt-4 h-4 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full transition-all ${full ? "bg-red-500" : "bg-brand-mid"}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      {full && (
        <p className="mt-2 text-sm text-red-600">
          Storage full — affected users will be notified. Subscribe for more storage?
        </p>
      )}
    </div>
  );
}
