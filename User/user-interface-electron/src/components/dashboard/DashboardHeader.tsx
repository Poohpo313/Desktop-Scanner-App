import { useWorkspaceStatus } from "../../hooks/useWorkspaceStatus";
import { GatewayStatusBadge } from "../layout/GatewayStatusBadge";
import { KeyExpiryIndicator } from "./KeyExpiryIndicator";
import { StatusBadge } from "./StatusBadge";
import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageTitle } from "../layout/consolePageMeta";

type Props = {
  title?: string;
  subtitle?: string;
};

export function DashboardHeader({ title, subtitle }: Props) {
  const { scannerConnected } = useWorkspaceStatus();
  const resolvedTitle = title ?? getConsolePageTitle("Dashboard");

  return (
    <ConsolePageHeader
      title={resolvedTitle}
      subtitle={subtitle}
      badges={
        <>
          <GatewayStatusBadge />
          <StatusBadge
            label={scannerConnected ? "Scanner: Connected" : "Scanner: Disconnected"}
            icon="scan"
            active={scannerConnected}
          />
          <KeyExpiryIndicator />
        </>
      }
    />
  );
}
