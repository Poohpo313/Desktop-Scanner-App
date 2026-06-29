import PortalScreen from "../components/portal/PortalScreen";
import AdminDashboardBody from "../components/AdminDashboardBody";
import ProvideAssistanceModal from "../components/portal/ProvideAssistanceModal";

const FIGMA_ID = "2212:6605";

export function AdminDashboardProvideAssistanceScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="provide-assistance-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
      adminBody={<AdminDashboardBody variant="figma" />}
    >
      <ProvideAssistanceModal closeTo="/admin-dashboard-2226-1193" />
    </PortalScreen>
  );
}

export default AdminDashboardProvideAssistanceScreen;
