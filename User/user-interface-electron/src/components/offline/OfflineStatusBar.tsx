import { CloudOff, RefreshCw } from "lucide-react";
import { AppStatusBar } from "../layout/AppStatusBar";
import type { OfflineStatusBarLastItem } from "./OfflineConsoleHeader";

type OfflineStatusBarProps = {
  lastItem?: OfflineStatusBarLastItem;
};

const DEFAULT_LAST_ITEM: OfflineStatusBarLastItem = {
  icon: RefreshCw,
  label: "Last Sync: Offline",
};

export function OfflineStatusBar({ lastItem = DEFAULT_LAST_ITEM }: OfflineStatusBarProps) {
  return <AppStatusBar variant="offline-status-bar" lastItem={lastItem} />;
}

export const HELP_ASSISTANT_OFFLINE_STATUS: OfflineStatusBarLastItem = {
  icon: CloudOff,
  label: "Help topics not available offline",
};
