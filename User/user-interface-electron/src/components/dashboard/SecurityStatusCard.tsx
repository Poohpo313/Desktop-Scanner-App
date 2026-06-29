import { Shield } from "lucide-react";

export function SecurityStatusCard({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="mx-2 mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,135,104,0.25)]"
        title="Secure & Ready"
      >
        <Shield className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
      </div>
    );
  }

  return (
    <div className="mx-4 rounded-2xl border border-white/[0.08] bg-white/[0.06] p-[18px] backdrop-blur-[8px]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(0,135,104,0.25)]">
        <Shield className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
      </div>

      <h3 className="font-sans text-lg font-semibold leading-tight text-white">
        Secure &amp; Ready
      </h3>

      <p className="mt-2 font-sans text-[13px] font-normal leading-[1.6] text-white/75">
        Your workspace is protected and ready to scan.
      </p>

      <div className="mt-4 inline-flex h-7 items-center gap-2 rounded-full border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.12)] px-3">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E]" />
        <span className="font-sans text-xs text-[#D1FAE5]">All systems operational</span>
      </div>
    </div>
  );
}
