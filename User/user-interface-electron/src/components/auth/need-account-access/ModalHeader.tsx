import { ShieldCheck } from "lucide-react";

export function ModalHeader() {
  return (
    <div
      className="mb-6 mt-2 flex h-14 w-14 items-center justify-center rounded-[18px] border border-[rgba(0,135,104,0.15)] bg-[linear-gradient(180deg,#DDF0ED_0%,#CFE7E3_100%)]"
      aria-hidden="true"
    >
      <ShieldCheck className="h-7 w-7 text-[#0B5F58]" strokeWidth={1.8} />
    </div>
  );
}
