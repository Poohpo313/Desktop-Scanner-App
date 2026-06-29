import { useNavigate } from "react-router-dom";
import { useAppMode } from "../../context/AppModeContext";
import { useGatewayStatus } from "../../context/GatewayStatusContext";
import { GATEWAY_SETTINGS_NAV_STATE } from "../../lib/gatewaySettingsNavigation";
import { StatusBadge } from "../dashboard/StatusBadge";

type Props = {
  prefix?: string;
};

export function GatewayStatusBadge({ prefix = "" }: Props) {
  const navigate = useNavigate();
  const { isOnline } = useAppMode();
  const { reachable, checking } = useGatewayStatus();

  if (!isOnline) return null;

  const gatewayOk = reachable === true;
  const label = checking
    ? `${prefix}Checking Gateway...`.trim()
    : gatewayOk
      ? `${prefix}Gateway Connected`.trim()
      : `${prefix}Gateway Unreachable`.trim();

  const canConfigure = !checking && !gatewayOk;

  function openGatewaySettings() {
    navigate("/settings", { state: GATEWAY_SETTINGS_NAV_STATE });
  }

  return (
    <StatusBadge
      label={label}
      icon="cloud"
      active={gatewayOk && !checking}
      onClick={canConfigure ? openGatewaySettings : undefined}
      title={canConfigure ? "Open gateway server settings" : undefined}
    />
  );
}
