import { UserAvatar } from "../../profile/UserAvatar";

type UserProfileHeaderProps = {
  displayName: string;
  initials: string;
  photoUrl?: string | null;
  status: string;
};

export function UserProfileHeader({
  displayName,
  initials,
  photoUrl,
  status,
}: UserProfileHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <UserAvatar name={displayName || initials} photoUrl={photoUrl} className="h-[52px] w-[52px] shrink-0 text-xl" />
        <div className="min-w-0">
          <p className="font-sans text-lg font-semibold leading-tight text-white">
            {displayName}
          </p>
          <p className="mt-0.5 font-sans text-sm font-normal text-white/85">
            {status}
          </p>
        </div>
      </div>
      <hr className="mb-3 mt-4 border-0 border-t border-white/10" />
    </>
  );
}
