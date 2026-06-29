import AdminPortalPage from "../components/portal/AdminPortalPage";
import ActivityLogsScreenBody from "../components/portal/ActivityLogsScreenBody";

const FIGMA_ID = "2212:3582";

export function AdminDashboardActivityLogsScreen() {
  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="admin-dashboard-activity-logs"
      breadcrumb={[
        { label: "Dashboard", to: "/admin-dashboard-2226-1193" },
        { label: "Activity Logs" },
      ]}
      showTopBar={false}
    >
      <ActivityLogsScreenBody variant="figma" />
    </AdminPortalPage>
  );
}

export default AdminDashboardActivityLogsScreen;
