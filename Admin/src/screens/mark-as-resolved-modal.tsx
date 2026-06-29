import PortalScreen from "../components/portal/PortalScreen";
import HelpSupportBody from "../components/portal/HelpSupportBody";
import { MarkAsResolvedModal } from "../components/portal/AdminModals";

const FIGMA_ID = "2212:6246";

export function MarkAsResolvedModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="mark-as-resolved-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Help & Support" }]}
      adminBody={<HelpSupportBody />}
    >
      <MarkAsResolvedModal />
    </PortalScreen>
  );
}

export default MarkAsResolvedModalScreen;
