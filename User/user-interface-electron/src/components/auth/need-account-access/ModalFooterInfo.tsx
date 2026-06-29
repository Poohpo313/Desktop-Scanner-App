import { Info } from "lucide-react";

export function ModalFooterInfo() {
  return (
    <div className="mt-2 flex w-full items-start gap-3 rounded-[14px] border border-[rgba(0,135,104,0.12)] bg-[rgba(0,135,104,0.04)] px-[18px] py-3.5">
      <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#0B5F58]" strokeWidth={1.8} />
      <p className="font-sans text-[13px] leading-[1.6] text-[#475569]">
        Only authorized administrators can provide account credentials and serial keys.
      </p>
    </div>
  );
}
