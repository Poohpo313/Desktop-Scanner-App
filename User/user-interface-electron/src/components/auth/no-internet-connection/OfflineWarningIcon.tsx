import { AlertTriangle } from "lucide-react";

export function OfflineWarningIcon() {
  return (
    <div
      className="offline-warning-icon--pulse flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(245,158,11,0.20)] bg-[linear-gradient(180deg,#FFF4D8_0%,#FFEFC0_100%)]"
      aria-hidden="true"
    >
      <AlertTriangle className="h-[26px] w-[26px] text-[#F59E0B]" strokeWidth={2.2} />
    </div>
  );
}
