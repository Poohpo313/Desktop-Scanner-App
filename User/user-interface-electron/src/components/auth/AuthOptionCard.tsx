import { Link } from "react-router-dom";
import { FigmaIcon } from "../FigmaIcon";
import type { IconName } from "../../icons";
import { icons } from "../../icons";

type Props = {
  to: string;
  icon: IconName;
  title: string;
  description: string;
};

export function AuthOptionCard({ to, icon, title, description }: Props) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border-2 border-brand-border p-4 transition hover:border-brand-emerald hover:bg-brand-mint/20 group"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-mint">
        <img src={icons[icon]} alt="" className="w-6 h-6 object-contain" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 group-hover:text-brand-emerald transition">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      <FigmaIcon name="chevron" className="w-5 h-5 text-brand-emerald shrink-0" />
    </Link>
  );
}
