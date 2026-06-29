import { Check } from "lucide-react";

export function SuccessIcon() {
  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[rgba(11,95,88,0.12)] bg-[linear-gradient(180deg,#E8F6F1_0%,#D9EEE8_100%)] auth-success-icon--pop"
      aria-hidden="true"
    >
      <Check className="h-[26px] w-[26px] text-[#0B5F58]" strokeWidth={2.5} />
    </div>
  );
}
