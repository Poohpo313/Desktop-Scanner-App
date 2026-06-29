import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type AccessOptionCardProps = {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export function AccessOptionCard({
  to,
  icon: Icon,
  title,
  description,
}: AccessOptionCardProps) {
  return (
    <Link
      to={to}
      className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-[rgba(226,232,240,0.9)] bg-white p-[18px] shadow-[0_2px_6px_rgba(15,23,42,0.04)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-[rgba(0,135,104,0.25)] hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#E6F5F1_0%,#D8ECE8_100%)]">
        <Icon className="h-5 w-5 text-[#0B5F58]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="font-sans text-base font-semibold text-[#0F172A]">{title}</p>
        <p className="mt-0.5 font-sans text-[13px] leading-normal text-[#64748B]">
          {description}
        </p>
      </div>
    </Link>
  );
}
