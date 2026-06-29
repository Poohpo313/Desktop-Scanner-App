import type { AdminUser, Device } from "../types";

type Props = {
  device: Device;
  users: AdminUser[];
  onFlagInactive: (device: Device) => void;
  flagging?: boolean;
};

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-slate-100 text-slate-600",
    unauthorized: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-slate-100"}`}>
      {status}
    </span>
  );
}

export default function DeviceCard({ device, users, onFlagInactive, flagging }: Props) {
  const assigned = users.find((u) => u.userId === device.assignedUser);

  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-brand-dark">{device.deviceName ?? "Unknown device"}</h3>
          <p className="text-xs text-slate-500 mt-1">{device.deviceType ?? "scanner"}</p>
        </div>
        {statusBadge(device.status)}
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Serial</dt>
          <dd className="font-mono text-xs">{device.serialNumber ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Assigned user</dt>
          <dd>{assigned?.username ?? (device.assignedUser ? `#${device.assignedUser}` : "—")}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Last seen</dt>
          <dd className="text-slate-600">
            {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "—"}
          </dd>
        </div>
      </dl>

      {device.status === "active" && (
        <button
          type="button"
          disabled={flagging}
          onClick={() => onFlagInactive(device)}
          className="mt-4 w-full rounded-lg border border-amber-300 bg-amber-50 py-2 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-50"
        >
          Flag inactive → notify Super Admin
        </button>
      )}
    </article>
  );
}
