import { ChevronDown, ChevronUp } from "lucide-react";
import { UserAvatar } from "../../profile/UserAvatar";

type AccountSummaryCardProps = {
  displayName: string;
  initials: string;
  photoUrl?: string | null;
  status: string;
  open: boolean;
  onClick: () => void;
  compact?: boolean;
  stacked?: boolean;
};

export function AccountSummaryCard({
  displayName,
  initials,
  photoUrl,
  status,
  open,
  onClick,
  compact = false,
  stacked = false,
}: AccountSummaryCardProps) {
  const topMargin = stacked ? "mt-0" : "mt-3";
  const Chevron = open ? ChevronUp : ChevronDown;

  if (compact) {
    return (
      <button
        type="button"
        className="mx-2 mb-4 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/10"
        onClick={onClick}
        aria-expanded={open}
        aria-label="Toggle account menu"
      >
        <UserAvatar name={displayName} photoUrl={photoUrl} className="h-10 w-10 text-xs" />
      </button>
    );
  }

  if (open) {
    return (
      <button
        type="button"
        className={`mx-4 mb-2 ${topMargin} flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 text-left transition-colors hover:bg-white/[0.08]`}
        onClick={onClick}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Close account menu"
      >
        <UserAvatar name={displayName} photoUrl={photoUrl} className="h-12 w-12 shrink-0 text-sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-sans text-base font-semibold text-white">
            {displayName}
          </span>
          <span className="block truncate font-sans text-[13px] text-white/80">
            {status}
          </span>
        </span>
        <Chevron className="h-[18px] w-[18px] shrink-0 text-white/90" strokeWidth={1.8} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`mx-4 mb-2 ${topMargin} flex w-[calc(100%-2rem)] items-center gap-3 rounded-[14px] border border-white/[0.08] bg-white/[0.05] p-3 text-left transition-colors hover:bg-white/[0.08]`}
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-label="Open account menu"
    >
      <UserAvatar name={displayName} photoUrl={photoUrl} className="h-10 w-10 shrink-0 text-sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-sans text-[13px] font-semibold text-white">
          {displayName}
        </span>
        <span className="block truncate font-sans text-[11px] text-white/65">
          {status}
        </span>
      </span>
      <Chevron className="h-4 w-4 shrink-0 text-white/60" strokeWidth={1.8} />
    </button>
  );
}
