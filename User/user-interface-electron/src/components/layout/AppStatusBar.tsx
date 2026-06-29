import { Clock, Cloud, Database, FolderOpen, RefreshCw, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppMode } from "../../context/AppModeContext";
import { useGatewayStatus } from "../../context/GatewayStatusContext";
import { GATEWAY_SETTINGS_NAV_STATE } from "../../lib/gatewaySettingsNavigation";
import { useStatusBarInfo } from "../../hooks/useStatusBarInfo";

export type StatusBarVariant =
  | "search-status-bar"
  | "settings-status-bar"
  | "save-pref-status-bar"
  | "devices-status-bar"
  | "help-assistant-status-bar"
  | "offline-status-bar"
  | "about-status-bar";

type StatusBarLastItem = {
  icon: LucideIcon;
  label: string;
};

type AppStatusBarProps = {
  variant: StatusBarVariant;
  lastItem?: StatusBarLastItem;
  localStoragePath?: string;
  databaseLabel?: string;
};

export function AppStatusBar({
  variant,
  lastItem,
  localStoragePath,
  databaseLabel,
}: AppStatusBarProps) {
  const navigate = useNavigate();
  const { isOnline } = useAppMode();
  const { reachable, checking } = useGatewayStatus();
  const { primaryFolder, databaseType, lastSyncLabel } = useStatusBarInfo();
  const LastIcon = lastItem?.icon ?? (variant === "offline-status-bar" ? RefreshCw : Clock);
  const lastLabel = lastItem?.label ?? `Last Sync: ${lastSyncLabel}`;
  const gatewayLabel = !isOnline
    ? "Gateway: Offline mode"
    : checking
      ? "Gateway: Checking..."
      : reachable
        ? "Gateway: Connected"
        : "Gateway: Unreachable";
  const canConfigureGateway = isOnline && !checking && !reachable;

  function openGatewaySettings() {
    navigate("/settings", { state: GATEWAY_SETTINGS_NAV_STATE });
  }

  return (
    <footer className={variant}>
      <span className={`${variant}__item`}>
        <FolderOpen className={`${variant}__icon`} strokeWidth={1.8} />
        Local Storage: {localStoragePath ?? primaryFolder}
      </span>
      <span className={`${variant}__item`}>
        <Database className={`${variant}__icon`} strokeWidth={1.8} />
        Database: {databaseLabel ?? databaseType}
      </span>
      {canConfigureGateway ? (
        <button
          type="button"
          className={`${variant}__item ${variant}__item--link`}
          onClick={openGatewaySettings}
          title="Open gateway server settings"
        >
          <Cloud className={`${variant}__icon`} strokeWidth={1.8} />
          {gatewayLabel}
        </button>
      ) : (
        <span className={`${variant}__item`}>
          <Cloud className={`${variant}__icon`} strokeWidth={1.8} />
          {gatewayLabel}
        </span>
      )}
      <span className={`${variant}__item`}>
        <LastIcon className={`${variant}__icon`} strokeWidth={1.8} />
        {lastLabel}
      </span>
    </footer>
  );
}
