import AdminPortalPage from "../components/portal/AdminPortalPage";
import LicenseKeyManagementScreenBody from "../components/portal/LicenseKeyManagementScreenBody";
import "../styles/license-key-catalog-screen.css";

const FIGMA_ID = "2226:2536";

export function LicenseKeyManagement22262536Screen() {
  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="license-key-management-2226-2536"
      breadcrumb={[
        { label: "User Registration", to: "/user-management-2226-1953" },
        { label: "Keys" },
      ]}
      showHeaderUtilities={false}
    >
      <LicenseKeyManagementScreenBody />
    </AdminPortalPage>
  );
}

export default LicenseKeyManagement22262536Screen;
