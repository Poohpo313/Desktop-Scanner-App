import { WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOfflineSectionMessage } from "./offlineSectionCopy";

type OfflineStateCardProps = {
  section: string;
};

export function OfflineStateCard({ section }: OfflineStateCardProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[520px]">
      <div
        className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(180deg,#FFF1F2_0%,#FFE4E6_100%)]"
        aria-hidden="true"
      >
        <WifiOff className="h-9 w-9 text-[#E11D48]" strokeWidth={1.8} />
      </div>

      <h2 className="m-0 font-sans text-[26px] font-semibold leading-tight text-[#0F172A] sm:text-[28px]">
        Oops! No Internet
      </h2>

      <p className="mx-auto mt-3 max-w-[440px] font-sans text-sm font-normal leading-[1.75] text-[#64748B]">
        {getOfflineSectionMessage(section)}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/scan")}
          className="h-11 min-w-[140px] rounded-[10px] border-0 bg-[linear-gradient(180deg,#008768_0%,#00755B_100%)] px-6 font-sans text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,135,104,0.22)] transition-all duration-200 hover:-translate-y-px hover:bg-[linear-gradient(180deg,#009A77_0%,#008768_100%)]"
        >
          Go to Scan
        </button>
        <button
          type="button"
          onClick={() => navigate("/checking-connection")}
          className="inline-flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-6 font-sans text-sm font-medium text-[#334155] transition-all duration-200 hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
        >
          <WifiOff className="h-4 w-4 text-[#E11D48]" aria-hidden="true" />
          Retry Connection
        </button>
      </div>
    </div>
  );
}
