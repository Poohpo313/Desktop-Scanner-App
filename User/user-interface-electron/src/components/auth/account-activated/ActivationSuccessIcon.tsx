import { Check } from "lucide-react";

export function ActivationSuccessIcon() {
  return (
    <div
      className="flex h-[76px] w-[76px] items-center justify-center rounded-[24px] border border-[rgba(34,197,94,0.2)] bg-[rgba(16,185,129,0.1)] auth-success-icon--pop"
      aria-hidden="true"
    >
      <Check className="h-[34px] w-[34px] text-[#22C55E]" strokeWidth={2.5} />
    </div>
  );
}
