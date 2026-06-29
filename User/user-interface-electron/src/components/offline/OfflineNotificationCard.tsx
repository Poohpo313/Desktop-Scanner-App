import { CloudOff } from "lucide-react";

type OfflineNotificationCardProps = {
  compact?: boolean;
};

export function OfflineNotificationCard({ compact = false }: OfflineNotificationCardProps) {
  if (compact) {
    return (
      <div
        className="mx-2 mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(59,130,246,0.18)]"
        title="You're offline"
      >
        <CloudOff className="h-[18px] w-[18px] text-white/90" strokeWidth={1.8} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[rgba(15,23,42,0.22)] p-[18px] backdrop-blur-[8px]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(59,130,246,0.18)]">
        <CloudOff className="h-[18px] w-[18px] text-white/90" strokeWidth={1.8} />
      </div>

      <p className="font-sans text-[13px] font-medium leading-[1.6] text-white/85">
        You&apos;re offline. Connect to the internet to access all features.
      </p>
    </div>
  );
}
