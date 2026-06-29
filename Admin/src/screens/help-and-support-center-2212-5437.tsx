import AdminPortalPage from "../components/portal/AdminPortalPage";
import HelpSupportBody from "../components/portal/HelpSupportBody";

const FIGMA_ID = "2212:5437";

export function HelpAndSupportCenter22125437Screen() {
  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="help-and-support-center-2212-5437"
      breadcrumb={[{ label: "Devices", to: "/device-management" }, { label: "Help" }]}
    >
      <HelpSupportBody />
    </AdminPortalPage>
  );
}

export default HelpAndSupportCenter22125437Screen;
