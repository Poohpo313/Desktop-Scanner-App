import { Wifi } from "lucide-react";

export function ConnectionIcon() {
  return (
    <div
      className="connection-icon-pulse flex h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-[rgba(0,135,104,0.08)] bg-[linear-gradient(180deg,#DCEBEA_0%,#CFE0DF_100%)]"
      aria-hidden="true"
    >
      <Wifi className="connection-wifi-pulse h-[30px] w-[30px] text-[#6B8282]" strokeWidth={2.5} />
    </div>
  );
}
