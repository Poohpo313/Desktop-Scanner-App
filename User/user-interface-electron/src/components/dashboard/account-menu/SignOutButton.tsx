import { LogOut } from "lucide-react";

type SignOutButtonProps = {
  onClick: () => void;
};

export function SignOutButton({ onClick }: SignOutButtonProps) {
  return (
    <>
      <hr className="mb-2 mt-2 border-0 border-t border-white/10" />
      <button
        type="button"
        role="menuitem"
        className="flex h-[42px] w-full cursor-pointer items-center gap-2.5 self-stretch rounded-lg px-1.5 pb-2 pt-0 font-sans text-base font-medium text-[#FF6B6B] transition-all duration-200 ease-in-out hover:bg-[rgba(255,107,107,0.08)]"
        onClick={onClick}
      >
        <LogOut className="h-[18px] w-[18px] shrink-0 text-[#FF6B6B]" strokeWidth={1.8} />
        <span>Sign Out</span>
      </button>
    </>
  );
}
