import { CircleHelp, Save, Settings } from "lucide-react";
import { AccountMenuItem } from "./AccountMenuItem";
import { SignOutButton } from "./SignOutButton";
import { UserProfileHeader } from "./UserProfileHeader";

export type AccountMenuProps = {
  displayName: string;
  initials: string;
  photoUrl?: string | null;
  status: string;
  onAccountSettings: () => void;
  onSavePreferences: () => void;
  onHelpAssistant: () => void;
  onSignOut: () => void;
};

export function AccountMenu({
  displayName,
  initials,
  photoUrl,
  status,
  onAccountSettings,
  onSavePreferences,
  onHelpAssistant,
  onSignOut,
}: AccountMenuProps) {
  return (
    <div
      className="w-[290px] rounded-[18px] border border-white/[0.08] bg-[linear-gradient(180deg,#005A55_0%,#003534_100%)] p-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.20)]"
      role="menu"
      aria-label="Account menu"
    >
      <UserProfileHeader
        displayName={displayName}
        initials={initials}
        photoUrl={photoUrl}
        status={status}
      />

      <div className="flex flex-col gap-1">
        <AccountMenuItem
          icon={Settings}
          label="Account Settings"
          onClick={onAccountSettings}
        />
        <AccountMenuItem
          icon={Save}
          label="Save Preferences"
          onClick={onSavePreferences}
        />
        <AccountMenuItem
          icon={CircleHelp}
          label="Help Assistant"
          onClick={onHelpAssistant}
        />
      </div>

      <SignOutButton onClick={onSignOut} />
    </div>
  );
}
