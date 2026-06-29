import PortalScreen from "../components/portal/PortalScreen";
import AdminDashboardBody from "../components/AdminDashboardBody";
import { RegisterUserModal } from "../components/portal/AdminModals";

const FIGMA_ID = "2212:3308";

export function AdminDashboardUserRegisterModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="admin-dashboard-user-register-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
      adminBody={<AdminDashboardBody variant="figma" />}
    >
      <RegisterUserModal closeTo="/admin-dashboard-2226-1193" confirmTo="/admin-dashboard-2226-1193" />
    </PortalScreen>
  );
}

export default AdminDashboardUserRegisterModalScreen;
