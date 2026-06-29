import PortalScreen from "../components/portal/PortalScreen";
import AdminDashboardBody from "../components/AdminDashboardBody";
import { ViewDevicesModal } from "../components/portal/AdminModals";

const FIGMA_ID = "2212:3582";

export function AdminDashboardViewDevicesScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="admin-dashboard-view-devices"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
      adminBody={<AdminDashboardBody variant="figma" />}
    >
      <ViewDevicesModal closeTo="/admin-dashboard-2226-1193" />
    </PortalScreen>
  );
}

export default AdminDashboardViewDevicesScreen;
