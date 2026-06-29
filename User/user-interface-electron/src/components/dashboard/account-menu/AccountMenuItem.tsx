import type { LucideIcon } from "lucide-react";

type AccountMenuItemProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

export function AccountMenuItem({ icon: Icon, label, onClick }: AccountMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex h-[42px] w-full cursor-pointer items-center gap-2.5 self-stretch rounded-lg px-1.5 pb-2 pt-0 font-sans text-base font-medium text-white transition-all duration-200 ease-in-out hover:bg-white/[0.08]"
      onClick={onClick}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 text-white/90" strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  );
}
