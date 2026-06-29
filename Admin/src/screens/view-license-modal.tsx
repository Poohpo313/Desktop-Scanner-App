import PortalScreen from "../components/portal/PortalScreen";
import LicenseKeyManagementBody from "../components/portal/LicenseKeyManagementBody";
import ViewLicenseModal from "../components/portal/ViewLicenseModal";

const FIGMA_ID = "2212:9548";

export function ViewLicenseModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="view-license-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Serial Key Management" }]}
      adminBody={<LicenseKeyManagementBody />}
    >
      <ViewLicenseModal closeTo="/license-key-management-2226-2536" />
    </PortalScreen>
  );
}

export default ViewLicenseModalScreen;
