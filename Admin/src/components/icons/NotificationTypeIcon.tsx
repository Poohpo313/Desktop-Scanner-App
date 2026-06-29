import { IconNotifyCheck, IconNotifyUserPlus } from "./AdminIcons";
import iconKey from "../../icons/notifications-center-key-icon.svg";
import iconShield from "../../icons/notifications-center-shield-icon.svg";
import type { NotificationCenterIconTone } from "../../data/demoNotificationsCenter";

type Props = {
  tone: NotificationCenterIconTone;
  size?: number;
  className?: string;
};

export default function NotificationTypeIcon({ tone, size = 18, className }: Props) {
  if (tone === "green-user") {
    return <IconNotifyUserPlus width={size} height={size} className={className} />;
  }

  if (tone === "blue-check" || tone === "green-check") {
    return <IconNotifyCheck width={size} height={size} className={className} />;
  }

  if (tone === "red-shield") {
    return (
      <img
        src={iconShield}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className={className}
      />
    );
  }

  return (
    <img src={iconKey} alt="" width={size} height={size} draggable={false} className={className} />
  );
}
