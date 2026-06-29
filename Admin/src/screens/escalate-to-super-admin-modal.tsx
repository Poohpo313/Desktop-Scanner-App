import PortalScreen from "../components/portal/PortalScreen";
import HelpSupportBody from "../components/portal/HelpSupportBody";
import { EscalateToSuperAdminModal } from "../components/portal/AdminModals";

const FIGMA_ID = "2212:5871";

export function EscalateToSuperAdminModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="escalate-to-super-admin-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Help & Support" }]}
      adminBody={<HelpSupportBody />}
    >
      <EscalateToSuperAdminModal />
    </PortalScreen>
  );
}

export default EscalateToSuperAdminModalScreen;
