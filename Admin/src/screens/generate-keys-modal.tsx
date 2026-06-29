import PortalScreen from "../components/portal/PortalScreen";
import LicenseKeyManagementBody from "../components/portal/LicenseKeyManagementBody";
import { GenerateKeysModal } from "../components/portal/AdminModals";

const FIGMA_ID = "2212:9882";

export function GenerateKeysModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="generate-keys-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Serial Key Management" }]}
      adminBody={<LicenseKeyManagementBody />}
    >
      <GenerateKeysModal />
    </PortalScreen>
  );
}

export default GenerateKeysModalScreen;
