import { Smartphone } from "lucide-react";

export function SMSIconHeader() {
  return (
    <div
      className="mb-6 mt-2 flex h-14 w-14 items-center justify-center rounded-[18px] border border-[rgba(0,135,104,0.12)] bg-[linear-gradient(180deg,#DDF0ED_0%,#CFE7E3_100%)]"
      aria-hidden="true"
    >
      <Smartphone className="h-6 w-6 text-[#0B5F58]" strokeWidth={2} />
    </div>
  );
}
