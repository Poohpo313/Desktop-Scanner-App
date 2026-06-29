import type { VerificationRequest } from "../types";

type Props = {
  items: VerificationRequest[];
  onAccept: (item: VerificationRequest) => void;
  onReject: (item: VerificationRequest) => void;
};

export default function UserCloudVerificationList({ items, onAccept, onReject }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No pending cloud verification requests.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.userId} className="flex items-center justify-between rounded-lg border bg-white p-4">
          <div>
            <p className="font-medium">{item.username}</p>
            <p className="text-xs text-slate-500">{item.email ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1">
              Requested {new Date(item.requestedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-brand-mid px-3 py-1.5 text-sm text-white"
              onClick={() => onAccept(item)}
            >
              Accept
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600"
              onClick={() => onReject(item)}
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
