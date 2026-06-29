import PortalScreen from "../components/portal/PortalScreen";
import AdminDashboardBody from "../components/AdminDashboardBody";
import SecurityIncidentDetailsModal from "../components/portal/SecurityIncidentDetailsModal";

const FIGMA_ID = "2226:1193";

export function AdminDashboardInvestigateSecurityScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="admin-dashboard-investigate-security"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
      adminBody={<AdminDashboardBody variant="figma" />}
    >
      <SecurityIncidentDetailsModal closeTo="/admin-dashboard-2226-1193" />
    </PortalScreen>
  );
}

export default AdminDashboardInvestigateSecurityScreen;
