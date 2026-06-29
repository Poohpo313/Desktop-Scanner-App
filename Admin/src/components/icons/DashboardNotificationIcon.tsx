import {
  IconNotifyCheck,
  IconNotifyPending,
  IconNotifyShieldCheck,
  IconNotifyUserPlus,
} from "./AdminIcons";
import type { DashboardNotificationIconTone } from "../../data/demoDashboard";

type Props = {
  tone: DashboardNotificationIconTone;
  size?: number;
  className?: string;
};

export default function DashboardNotificationIcon({ tone, size = 18, className }: Props) {
  if (tone === "blue") {
    return <IconNotifyUserPlus width={size} height={size} className={className} />;
  }

  if (tone === "green") {
    return <IconNotifyCheck width={size} height={size} className={className} />;
  }

  if (tone === "yellow") {
    return <IconNotifyPending width={size} height={size} className={className} />;
  }

  return <IconNotifyShieldCheck width={size} height={size} className={className} />;
}
