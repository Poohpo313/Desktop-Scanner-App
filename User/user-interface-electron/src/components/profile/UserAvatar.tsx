import { getProfileInitials } from "../../lib/profilePhotoStorage";

type Props = {
  name: string;
  photoUrl?: string | null;
  className?: string;
  imageClassName?: string;
  rounded?: "full" | "square";
};

export function UserAvatar({
  name,
  photoUrl,
  className = "",
  imageClassName = "",
  rounded = "full",
}: Props) {
  const radiusClass = rounded === "square" ? "rounded-[12px]" : "rounded-full";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={`object-cover ${radiusClass} ${className} ${imageClassName}`.trim()}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center bg-[#F2FAF8] font-semibold text-[#003534] ${radiusClass} ${className}`.trim()}
      aria-hidden="true"
    >
      {getProfileInitials(name || "User")}
    </span>
  );
}
