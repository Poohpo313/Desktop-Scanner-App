type Status = "connected" | "offline" | "pending";

const STYLES: Record<Status, string> = {
  connected: "bg-brand-mint text-brand-primary",
  offline: "bg-gray-100 text-gray-600",
  pending: "bg-amber-50 text-amber-700",
};

const DOT: Record<Status, string> = {
  connected: "bg-brand-emerald",
  offline: "bg-gray-400",
  pending: "bg-amber-500",
};

const LABEL: Record<Status, string> = {
  connected: "Connected",
  offline: "Offline",
  pending: "Pending",
};

type Props = {
  status: Status;
  className?: string;
};

export function StatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {LABEL[status]}
    </span>
  );
}
