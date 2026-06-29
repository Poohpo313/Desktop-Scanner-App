import { Settings } from "lucide-react";
import { UserAvatar } from "../../profile/UserAvatar";
import { AccountMenuItem } from "./AccountMenuItem";
import { SignOutButton } from "./SignOutButton";

type OfflineAccountMenuProps = {
  displayName: string;
  initials: string;
  photoUrl?: string | null;
  onAccountSettings: () => void;
  onSignOut: () => void;
};

export function OfflineAccountMenu({
  displayName,
  initials,
  photoUrl,
  onAccountSettings,
  onSignOut,
}: OfflineAccountMenuProps) {
  return (
    <div
      className="w-[290px] rounded-[18px] border border-white/[0.08] bg-[#06373A] p-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.20)]"
      role="menu"
      aria-label="Offline account menu"
    >
      <div className="flex items-center gap-3 rounded-xl bg-black/20 p-3">
        <UserAvatar name={displayName || initials} photoUrl={photoUrl} className="h-12 w-12 shrink-0 text-sm" />
        <div className="min-w-0">
          <p className="truncate font-sans text-base font-semibold text-white">{displayName}</p>
          <p className="mt-1 flex items-center gap-1.5 font-sans text-sm text-[#F59E0B]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" aria-hidden="true" />
            Offline Mode
          </p>
        </div>
      </div>

      <hr className="my-3 border-0 border-t border-white/10" />

      <AccountMenuItem icon={Settings} label="Account Settings" onClick={onAccountSettings} />

      <SignOutButton onClick={onSignOut} />
    </div>
  );
}
