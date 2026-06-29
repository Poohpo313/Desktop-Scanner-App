import PortalScreen from "../components/portal/PortalScreen";
import LicenseKeyManagementBody from "../components/portal/LicenseKeyManagementBody";
import { DeactivateKeyModal } from "../components/portal/AdminModals";
import "../styles/deactivate-key-modal.css";

const FIGMA_ID = "2212:9256";

export function DeactivateKeyModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="deactivate-key-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Serial Key Management" }]}
      adminBody={<LicenseKeyManagementBody />}
    >
      <DeactivateKeyModal />
    </PortalScreen>
  );
}

export default DeactivateKeyModalScreen;
