import PortalScreen from "../components/portal/PortalScreen";
import LicenseKeyManagementBody from "../components/portal/LicenseKeyManagementBody";
import { RevokeKeyModal } from "../components/portal/AdminModals";
import "../styles/revoke-key-modal.css";

const FIGMA_ID = "2212:8961";

export function RevokeKeyModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="revoke-key-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Serial Key Management" }]}
      adminBody={<LicenseKeyManagementBody />}
    >
      <RevokeKeyModal />
    </PortalScreen>
  );
}

export default RevokeKeyModalScreen;
