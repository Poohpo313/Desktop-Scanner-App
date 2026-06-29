import PortalScreen from "../components/portal/PortalScreen";
import AdminDashboardBody from "../components/AdminDashboardBody";
import { GenerateKeysSuccessModal } from "../components/portal/AdminModals";

const FIGMA_ID = "2212:3129";

export function AdminDashboardGenerateKeysScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="admin-dashboard-generate-keys"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
      adminBody={<AdminDashboardBody variant="figma" />}
    >
      <GenerateKeysSuccessModal closeTo="/admin-dashboard-2226-1193" confirmTo="/admin-dashboard-2226-1193" />
    </PortalScreen>
  );
}

export default AdminDashboardGenerateKeysScreen;
