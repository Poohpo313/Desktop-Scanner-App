import AdminPortalPage from "../components/portal/AdminPortalPage";
import LicenseKeyManagementBody from "../components/portal/LicenseKeyManagementBody";

const FIGMA_ID = "2212:8620";

export function LicenseKeyManagementScreen() {
  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="license-key-management"
      breadcrumb={[{ label: "User Registration", to: "/user-management-2226-1953" }, { label: "Keys" }]}
    >
      <LicenseKeyManagementBody />
    </AdminPortalPage>
  );
}

export default LicenseKeyManagementScreen;
