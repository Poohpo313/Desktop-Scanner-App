import { FigmaIcon } from "./FigmaIcon";

const pills = [
  { icon: "shield" as const, label: "Admin-controlled access" },
  { icon: "lock" as const, label: "Safe local scanning" },
  { icon: "wifi" as const, label: "Online/Offline ready" },
];

export function SecurityPills({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-brand-border pt-6 text-[11px] text-gray-400 ${className}`}
    >
      {pills.map((p) => (
        <span key={p.label} className="inline-flex items-center gap-1.5">
          <FigmaIcon name={p.icon} className="w-3.5 h-3.5 opacity-70" />
          {p.label}
        </span>
      ))}
    </div>
  );
}
