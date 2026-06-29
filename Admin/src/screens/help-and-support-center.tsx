import AdminPortalPage from "../components/portal/AdminPortalPage";
import HelpSupportBody from "../components/portal/HelpSupportBody";

const FIGMA_ID = "2212:5073";

export function HelpAndSupportCenterScreen() {
  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="help-and-support-center"
      breadcrumb={[{ label: "Devices", to: "/device-management" }, { label: "Help" }]}
    >
      <HelpSupportBody />
    </AdminPortalPage>
  );
}

export default HelpAndSupportCenterScreen;
